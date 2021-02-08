import {OrderDef} from '@app/models/order-def';
import {Category} from '@app/schema/category.schema';
import {Order} from '@app/schema/order.schema';
import {ProductCategory} from '@app/schema/product-category.schema';
import {Product} from '@app/schema/product.schema';
import {Review} from '@app/schema/review.schema';
import {Body, Controller, Get, Query, UseGuards} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {AuthGuard} from '@nestjs/passport';
import {IsDateString, IsNotEmpty} from 'class-validator';
import {Model} from 'mongoose';
import {OrderModel} from '../order/order.types';
import {ProductModel, ProductCategoryModel} from '../product/product.types';

class getReportDto {
  @IsNotEmpty()
  start: number;

  @IsNotEmpty()
  end: number;
}
@Controller('reports')
export class ReportsController {
  constructor(
    @InjectModel(Product.name) private productModel: ProductModel,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(ProductCategory.name) private productCategoryModel: ProductCategoryModel,
    @InjectModel(Order.name) private orderModel: OrderModel
  ) {}

  @Get('last-year')
  @UseGuards(AuthGuard('jwt'))
  async getLastYear(/* @Query() query: getReportDto */): Promise<Record<number, number>> {
    const start = new Date(2020, 0, 1).toISOString();
    const end = new Date(2020, 12, 1).toISOString();

    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
      .lean()
      .exec();

    const monthly = {};
    orders.forEach(order => {
      const createdAt = new Date(order.createdAt);
      const month = Number(new Date(createdAt.getFullYear(), createdAt.getMonth(), 1).getTime());
      monthly[month] = monthly[month] || 0;
      monthly[month] += order.total;
    });

    const result = Object.keys(monthly)
      .sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
      .reduce((obj, key) => {
        obj[key] = monthly[key];
        return obj;
      }, {});

    return result;
  }

  @Get('last-month')
  @UseGuards(AuthGuard('jwt'))
  async getLastMonth(/* @Query() query: getReportDto */): Promise<Record<number, number>> {
    const start = new Date(2020, 11, 1).toISOString();
    const end = new Date(2020, 12, 1).toISOString();

    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
      .lean()
      .exec();

    const daily = {};
    orders.forEach(order => {
      const createdAt = new Date(order.createdAt);
      const day = Number(new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate(), 0, 0).getTime());
      daily[day] = daily[day] || 0;
      daily[day] += order.total;
    });

    const result = Object.keys(daily)
      .sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
      .reduce((obj, key) => {
        obj[key] = daily[key];
        return obj;
      }, {});

    return result;
  }

  @Get('last-week')
  @UseGuards(AuthGuard('jwt'))
  async getLastWeek(/* @Query() query: getReportDto */): Promise<Record<number, number>> {
    const start = new Date(2020, 11, 21).toISOString();
    const end = new Date(2020, 11, 27).toISOString();

    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
      .lean()
      .exec();

    const daily = {};
    orders.forEach(order => {
      const createdAt = new Date(order.createdAt);
      const day = Number(new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate(), 0, 0).getTime());
      daily[day] = daily[day] || 0;
      daily[day] += order.total;
    });

    const result = Object.keys(daily)
      .sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
      .reduce((obj, key) => {
        obj[key] = daily[key];
        return obj;
      }, {});

    return result;

    return daily;
  }
}
