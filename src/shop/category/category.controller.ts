import {Controller, Body, Post, Query, Get, NotFoundException, Param, Delete, UseGuards, Patch} from '@nestjs/common';

import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {IsNotEmpty, Allow} from 'class-validator';
import {Category} from '@app/schema/category.schema';
import {Transform} from 'class-transformer';

import {AuthGuard} from '@nestjs/passport';
import {ProductCategory} from '@app/schema/product-category.schema';
import {InternalException} from '@app/common/internal.exception';

/* const uploadConfig = {
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
}; */

class createDto {
  @IsNotEmpty()
  name: string;
  @Allow()
  description: string;
}

class getAllDto {
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
    @InjectModel(Category.name) private categoryModel: categoryModel,
    @InjectModel(ProductCategory.name) private productCategoryModel: Model<ProductCategory>
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() req: createDto) {
    const category = new this.categoryModel((req as unknown) as Category);
    const result = await category.save();
    return result._id;
  }

  @Get('bulk')
  async getBulk(): Promise<any> {
    const result = this.categoryModel
      .find({})
      .lean()
      .exec();
    return result;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async edit(@Body() req: createDto, @Param('id') id): Promise<string> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException();
    }

    /*     let catImage = category.image;
    if (image && image.filename) {
      catImage = image.filename;
      if (category.image) {
        const oldImagePath = path.join(constants.uploadsDir, category.image);

        if (fs.existsSync(oldImagePath)) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          fs.unlinkSync(oldImagePath);
        }
      }
    } */
    // await category.save();
    const updResult = await this.categoryModel.findByIdAndUpdate(
      id,
      {
        name: req.name,
        description: req.description,
      },
      {new: true}
    );
    if (!updResult) {
      throw new InternalException();
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
