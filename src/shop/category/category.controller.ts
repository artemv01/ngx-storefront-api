import {
  Controller,
  Body,
  Post,
  HttpException,
  Query,
  Get,
  NotFoundException,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Put,
  Patch,
  All,
} from '@nestjs/common';
import {diskStorage} from 'multer';

import {FileInterceptor} from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import {InjectModel} from '@nestjs/mongoose';
import {Product} from '@app/schema/product.schema';
import {Model} from 'mongoose';
import {IsNotEmpty, Allow} from 'class-validator';
import {Review} from '@app/schema/review.schema';
import {Category} from '@app/schema/category.schema';
import {UnknownException} from '@app/common/unknown.exception';
import path, {extname} from 'path';
import fs from 'fs';
import {Transform} from 'class-transformer';

import {AuthGuard} from '@nestjs/passport';
import {ProductCategory} from '@app/schema/product-category.schema';
import {constants} from '@app/config/constants';

const uploadConfig = {
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return callback(new HttpException('Only image files are allowed!', 500), false);
    }
    callback(null, true);
  },
  storage: diskStorage({
    destination: constants.uploadsDir,
    filename: (req, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
};

class createDto {
  @IsNotEmpty()
  name: string;
  @Allow()
  description: string;
}

class getAllDto {
  @Allow()
  nopaginate: boolean;

  @IsNotEmpty()
  sortType = 'price';

  @IsNotEmpty()
  sortOrder = 'asc';
  @Allow()
  search: string;

  @Transform(val => (!isNaN(parseInt(val)) ? parseInt(val) : 1))
  @Allow()
  page: string;

  @Transform(val => (!isNaN(parseInt(val)) ? parseInt(val) : 10))
  @Allow()
  limit: string;

  @Allow()
  fields: string;
}

interface categoryModel extends Model<Category> {
  paginate: any;
}

@Controller('category')
export class CategoryController {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Category.name) private categoryModel: categoryModel,
    @InjectModel(ProductCategory.name) private productCategoryModel: Model<ProductCategory>
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async create(@UploadedFile() image, @Body() req: createDto) {
    const category = new this.categoryModel((req as unknown) as Category);
    if (image && image.filename) {
      category.image = image.filename;
    }

    const result = await category.save();
    return result._id;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async edit(@UploadedFile() image, @Body() req: createDto, @Param('id') id): Promise<string> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException();
    }

    let catImage = category.image;
    if (image && image.filename) {
      catImage = image.filename;
      if (category.image) {
        const oldImagePath = path.join(constants.uploadsDir, category.image);

        if (fs.existsSync(oldImagePath)) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    // await category.save();
    const updResult = await this.categoryModel.findByIdAndUpdate(
      id,
      {
        name: req.name,
        image: catImage,
        description: req.description,
      },
      {new: true}
    );
    if (!updResult) {
      throw new UnknownException();
    }
    return updResult._id;
  }

  @Get('')
  async getAll(@Query() query: getAllDto): Promise<any> {
    let select = '';
    if (query.fields) {
      select = query.fields;
    }

    let search = {};
    let searchStr;
    if (query.search) {
      searchStr = `${query.search}`;
      search = {
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

    if (query.page) {
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

      const itemsPaginate = await this.categoryModel.paginate(search, {
        ...paginationConfig,
        select: select,
        sort: {[query.sortType]: query.sortOrder},
      });

      const {total, limit, page, pages, docs} = itemsPaginate;
      return {items: docs, total, limit, page, pages};
    }

    const result = await this.categoryModel
      .find(search)
      .select(select)
      .limit(5)
      .lean()
      .exec();
    if (!select || select.indexOf('productNumber') !== -1) {
      for (let i = 0; i < result.length; i++) {
        (result[i] as any).productNumber = await this.productCategoryModel.countDocuments({
          category: result[i]._id,
        });
      }
    }

    return result;
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException();
    }
    const products = await category.getItems();
    return {
      products: products,
      ...category.toObject(),
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException();
    }
  }
}
