import {Review} from '@app/schema/review.schema';
import {IsNotEmpty, Min, Max, Allow, IsNumberString, IsOptional} from 'class-validator';
import {Model} from 'mongoose';
import {Transform} from 'class-transformer';

export interface ReviewRO {
  authorEmail: string;
  authorName: string;
  rating: number;
  content: string;
  productId: string;
}
export class getRecentDto {
  @IsNumberString()
  @IsOptional()
  limit?: number;
}
export class reviewDto {
  @IsNotEmpty()
  authorEmail: string;
  @IsNotEmpty()
  authorName: string;

  @IsNotEmpty()
  @Min(0)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  captcha: string;
}

export class reviewEditDto {
  @IsNotEmpty()
  authorEmail: string;
  @IsNotEmpty()
  authorName: string;
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @Min(0)
  @Max(5)
  rating: number;
}

export class reviewGetAllDto {
  @IsNotEmpty()
  sortType: string;

  @IsNotEmpty()
  sortOrder: string;

  @Allow()
  search: string;

  @Transform(val => (!isNaN(parseInt(val)) ? parseInt(val) : 1))
  @Allow()
  page: string;

  @Transform(val => (!isNaN(parseInt(val)) ? parseInt(val) : 10))
  @Allow()
  limit: string;

  @Allow()
  recent: boolean;
}

export interface CreateReviewResp {
  reviews: Review[];
  rating: number;
  ratingCount: number;
}

export interface reviewModel extends Model<Review> {
  paginate: any;
}
