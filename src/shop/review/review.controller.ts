import {
  Controller,
  Post,
  Body,
  Query,
  HttpException,
  Get,
  Param,
  NotFoundException,
  Delete,
  UseGuards,
  Patch,
  HttpService,
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Review} from '@app/schema/review.schema';
import {Model} from 'mongoose';
import {Product} from '@app/schema/product.schema';
import {AuthGuard} from '@nestjs/passport';
import {InternalException} from '@app/common/internal.exception';
import {
  reviewDto,
  reviewEditDto,
  reviewModel,
  reviewGetAllDto,
  ReviewRO,
  getRecentDto,
  CreateReviewResp,
  bulkDeleteDto,
} from './review.types';
import {ApiService} from '@app/service/api/api.service';
import {flatMap, catchError} from 'rxjs/operators';
import {pipe} from 'rxjs';

@Controller('review')
export class ReviewController {
  constructor(
    @InjectModel(Review.name) private reviewModel: reviewModel,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private api: ApiService
  ) {}

  @Patch('bulk-delete')
  @UseGuards(AuthGuard('jwt'))
  async bulkDelete(@Body() products: bulkDeleteDto): Promise<void> {
    await this.reviewModel.deleteMany({_id: {$in: products.itemIds}}).exec();
  }

  @Post()
  async create(@Body() req: reviewDto): Promise<CreateReviewResp> {
    const captchaResult = await this.api.verifyCaptcha(req.captcha);
    if (!captchaResult.data.success) {
      throw new HttpException(captchaResult.data['error-codes'], 400);
    }
    const review = await this.reviewModel.create(req);
    if (!review) {
      throw new InternalException();
    }
    const product = await this.productModel
      .findById(review.productId)
      .select('name reviews rating ratingCount')
      .exec();

    if (!product) {
      throw new InternalException();
    }
    product.ratingCount = product.ratingCount ? product.ratingCount : 0;
    product.ratingCount++;

    const reviewsForProduct: Review[] = await this.reviewModel.find({productId: review.productId}).exec();

    let currentRatingTotal = 0;
    for (const r of reviewsForProduct) {
      if (r.rating) {
        currentRatingTotal += r.rating;
      }
    }
    product.rating = currentRatingTotal / product.ratingCount;

    review.productName = product.name;
    await review.save();
    await product.save();

    return {
      reviews: reviewsForProduct,
      rating: product.rating,
      ratingCount: product.ratingCount,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async edit(@Body() req: reviewEditDto, @Param('id') id: string) {
    const review = await this.reviewModel.findById(id).exec();

    if (!review) {
      throw new NotFoundException();
    }
    const updResult = await this.reviewModel.findByIdAndUpdate(id, req, {new: true});
    if (!updResult) {
      throw new InternalException();
    }

    const reviewsForProduct: Review[] = await this.reviewModel.find({productId: review.productId}).exec();
    const product = await this.productModel.findById(review.productId).exec();
    if (!product) {
      throw new InternalException();
    }

    let currentRatingTotal = 0;
    for (const r of reviewsForProduct) {
      if (r.rating) {
        currentRatingTotal += r.rating;
      }
    }
    product.rating = currentRatingTotal / product.ratingCount;
    product.save();
    return updResult._id;
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getAll(@Query() query: reviewGetAllDto): Promise<any> {
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

    let search = {};
    let searchStr;
    if (query.search) {
      searchStr = `${query.search}`;
      search = {
        $or: [
          {
            authorName: new RegExp(searchStr, 'i'),
          },
          {
            authorEmail: new RegExp(searchStr, 'i'),
          },
          {
            content: new RegExp(searchStr, 'i'),
          },
        ],
      };
    }

    const itemsPaginate = await this.reviewModel.paginate(search, {
      ...paginationConfig,
      select: '-reviews',
      sort: {[query.sortType]: query.sortOrder},
    });

    const {total, limit, page, pages, docs} = itemsPaginate;
    return {items: docs, total, limit, page, pages};
  }

  @Get('recent')
  async getRecent(@Query() query: getRecentDto): Promise<ReviewRO[]> {
    const result = await this.reviewModel
      .find({})
      .sort({createdAt: -1})
      .limit(query.limit || 5)
      .lean()
      .exec();
    return result;
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getOne(@Param('id') id: string): Promise<Review> {
    const result = await this.reviewModel.findById(id).exec();
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string): Promise<void> {
    const result = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException();
    }
  }
}
