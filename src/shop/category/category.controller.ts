import {Controller, Body, Post, Query, Get, NotFoundException, Param, Delete, UseGuards, Patch} from '@nestjs/common';

import {InjectModel} from '@nestjs/mongoose';
import {Model, Mongoose, Types} from 'mongoose';
import {Category} from '@app/schema/category.schema';

import {AuthGuard} from '@nestjs/passport';
import {ProductCategory} from '@app/schema/product-category.schema';
import {InternalException} from '@app/common/internal.exception';
import {createDto, getAllDto, categoryModel} from './category.types';

@Controller('category')
export class CategoryController {
  constructor(
    @InjectModel(Category.name) private categoryModel: categoryModel,
    @InjectModel(ProductCategory.name) private productCategoryModel: Model<ProductCategory>
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() req: createDto): Promise<Types.ObjectId> {
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

    const sortType = query.sortType ? query.sortType : 'name';
    const sortOrder = query.sortOrder ? query.sortOrder : 'desc';

    const itemsPaginate = await this.categoryModel.paginate(search, {
      ...paginationConfig,
      sort: {[sortType]: sortOrder},
    });

    const {total, limit, page, pages, docs} = itemsPaginate;
    return {items: docs, total, limit, page, pages};
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
