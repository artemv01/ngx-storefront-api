import {
  Controller,
  Body,
  Post,
  Query,
  Get,
  NotFoundException,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Patch,
  HttpException,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import {InjectModel} from '@nestjs/mongoose';
import {Product} from '@app/schema/product.schema';
import {Model, Types} from 'mongoose';
import {IsNotEmpty, ValidateIf, Allow} from 'class-validator';
import {Transform} from 'class-transformer';
import {Review} from '@app/schema/review.schema';
import {ProductCategory} from '@app/schema/product-category.schema';
import {Category} from '@app/schema/category.schema';
import {AuthGuard} from '@nestjs/passport';
import {UploaderService} from '@app/service/uploader/uploader.service';
import {InternalException} from '@app/common/internal.exception';
import {diskStorage} from 'multer';
import {diskStorageConfig} from '@app/config/dist-storage-config';
import {s3StorageConfig} from '@app/config/s3-storage-config';
import {uploadConfig} from '@app/config/upload-config';
import {deleteImage} from '@app/helpers/delete-image';

class createProductDto {
  @IsNotEmpty()
  name: string;

  @Allow()
  description: string;

  @IsNotEmpty()
  price: number;

  @Transform(salePrice => (isNaN(Number(salePrice)) ? 0 : salePrice))
  @ValidateIf(o => o.salePrice)
  salePrice: number;

  @Allow()
  onSale: boolean;
  @Allow()
  categories: string;
  @Allow()
  image: string;
}

class getAllDto {
  @IsNotEmpty()
  sortType = 'price';

  @IsNotEmpty()
  sortOrder = 'asc';

  @Transform(val => (!isNaN(parseInt(val)) ? parseInt(val) : 1))
  @Allow()
  page: string;
  @Transform(val => (!isNaN(parseInt(val)) ? parseInt(val) : 10))
  @Allow()
  limit: string;

  @Allow()
  search: string;

  @Allow()
  categoryId: string;

  @Allow()
  onSale: boolean;
}
class bulkDelete {
  @IsNotEmpty()
  productIds: string[];
}

interface ProductModel extends Model<Product> {
  paginate: any;
  aggregatePaginate: any;
}
interface ProductCategoryModel extends Model<ProductCategory> {
  paginate: any;
}

@Controller('product')
export class ProductController {
  constructor(
    private uploadServ: UploaderService,
    @InjectModel(Product.name) private productModel: ProductModel,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(ProductCategory.name) private productCategoryModel: ProductCategoryModel
  ) {}

  @Patch('bulk-delete')
  @UseGuards(AuthGuard('jwt'))
  async bulkDelete(@Body() products: bulkDelete): Promise<void> {
    const result = this.productModel.deleteMany({_id: {$in: products.productIds}}).exec();
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async edit(@UploadedFile() image, @Body() req: createProductDto, @Param('id') id): Promise<string> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException();
    }

    if (req.categories) {
      const categories = JSON.parse(req.categories);

      for (const cat of categories) {
        if (!cat._id) {
          const newCat = await this.categoryModel.create({name: cat.name} as Category);
          if (!newCat) {
            throw new InternalException();
          }
          cat._id = newCat._id;
        }
        if (cat.isNew && !cat.isDelete) {
          await this.productCategoryModel.create({
            product: product._id,
            category: Types.ObjectId(cat._id),
          });
        }
        if (cat.toDelete) {
          await this.productCategoryModel.findOneAndDelete({
            product: product._id,
            category: Types.ObjectId(cat._id),
          });
        }
      }
    }

    let prodImage = product.image ? product.image : '';
    if (image) {
      const oldImage = prodImage.split('/').pop();
      if (oldImage) {
        try {
          const deleteResult = await deleteImage(oldImage);
        } catch (err) {
          console.log(`Error deleting file from storage ${process.env.STORAGE_TYPE}: ${err}`);
          // TODO: Log this
        }
      }
      if (process.env.STORAGE_TYPE === 'DISK') {
        prodImage = process.env.UPLOADS_URL.replace(/\/$/, '') + '/' + image.filename;
      } else {
        prodImage = image.location;
      }
    }
    const updResult = await this.productModel.findByIdAndUpdate(
      id,
      {
        name: req.name,
        image: prodImage,
        description: req.description,
        salePrice: req.salePrice,
        price: req.price,
        onSale: req.onSale,
      },
      {new: true}
    );
    if (!updResult) {
      throw new InternalException();
    }
    return updResult._id;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async create(@UploadedFile() image, @Body() req: createProductDto) {
    const product = new this.productModel((req as unknown) as Product);
    if (image) {
      if (process.env.STORAGE_TYPE === 'DISK') {
        product.image = process.env.UPLOADS_URL.replace(/\/$/, '') + '/' + image.filename;
      } else {
        product.image = image.location;
      }
    }

    const newProduct = await product.save();
    if (!newProduct) {
      throw new InternalException();
    }

    if (req.categories) {
      const categories = JSON.parse(req.categories);

      for (const cat of categories) {
        if (cat.isNew) {
          const catExists = await this.categoryModel.find({name: cat.name});
          if (!catExists || !catExists.length) {
            const newCat = await this.categoryModel.create({
              name: cat.name,
            } as Category);
            await this.productCategoryModel.create({
              product: Types.ObjectId(newProduct._id),
              category: Types.ObjectId(newCat._id),
            });
          }
        }
      }
    }

    return newProduct._id;
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') id: string): Promise<any> {
    const reviews = await this.reviewModel.find({productId: id}).exec();
    const product = await this.productModel.findById(id).exec();

    if (!reviews || !product) {
      throw new NotFoundException();
    }

    return {
      reviews,
      ratingCount: product.ratingCount,
      rating: product.rating,
    };
  }

  @Get('related')
  async getRelated(): Promise<any> {
    const result = await this.productModel
      .find({})
      .limit(3)
      .select('-updatedAt -_v ')
      .lean()
      .exec();
    return result;
  }

  @Get('/top-rated')
  async getTopRated(): Promise<any> {
    const result = await this.productModel
      .find()
      .sort({rating: 1})
      .limit(9)
      .select('-updatedAt -_v ')
      .lean()
      .exec();
    return result;
  }

  @Get('/sale')
  async getOnSale(): Promise<any> {
    const result = await this.productModel
      .find({onSale: true})
      .limit(9)
      .select('-updatedAt -_v ')
      .lean()
      .exec();
    return result;
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<any> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException();
    }

    const reviews = await product.getReviews();
    const categories = await product.getCategories();
    return {
      ...product.toObject(),
      reviews: reviews,
      categories: categories,
    };
  }

  @Get('')
  async getAll(@Query() query: getAllDto): Promise<any> {
    let paginationConfig = {};
    if (!query.page) {
      paginationConfig = {
        limit: 5,
        page: 1,
      };
    } else {
      paginationConfig = {
        limit: query.limit,
        page: query.page,
      };
    }

    let filter: any = {};
    let searchStr;
    if (query.search) {
      searchStr = `${query.search}`;
      filter = {
        $or: [
          {
            name: new RegExp(searchStr, 'i'),
          },
          {
            description: new RegExp(searchStr, 'i'),
          },
        ],
      };
    }
    let foundProductsInCategory = [],
      categoryName = '';
    if (query.categoryId) {
      foundProductsInCategory = await this.productCategoryModel
        .find({category: Types.ObjectId(query.categoryId)})
        .select('product')
        .lean()
        .exec();
      const category = await this.categoryModel.findById(query.categoryId);
      if (category) {
        categoryName = category.name;
      }
    }
    if (foundProductsInCategory.length) {
      filter._id = {};
      filter._id.$in = foundProductsInCategory.map(item => item.product);
    }

    const aggregation: any = {
      $match: filter,
      $project: {
        _id: 1,
        description: 1,
        name: 1,
        rating: 1,
        ratingCount: 1,
        image: 1,
        price: 1,
        salePrice: 1,
        onSale: 1,
      },
    };
    if (query.sortType == 'price') {
      aggregation.$project.sortPrice = {$cond: [{$eq: ['$onSale', true]}, '$salePrice', '$price']};
      aggregation.$sort = {sortPrice: query.sortOrder === 'asc' ? 1 : -1};
    } else {
      aggregation.$sort = {[query.sortType]: query.sortOrder === 'asc' ? 1 : -1};
    }
    const aggregationData = [];
    for (const [key, val] of Object.entries(aggregation)) {
      aggregationData.push({[key]: val});
    }
    if (query.sortType == 'price') {
      aggregationData.push({$project: {sortPrice: false}});
    }
    const agg = this.productModel.aggregate(aggregationData);
    const productsPaginate = await this.productModel.aggregatePaginate(agg, paginationConfig);
    const {totalDocs, limit, page, totalPages} = productsPaginate;
    return {
      products: productsPaginate.docs,
      categoryName: categoryName,
      total: totalDocs,
      limit,
      page,
      pages: totalPages,
    };
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException();
    }
  }
}
