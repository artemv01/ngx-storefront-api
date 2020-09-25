import {Category} from '@app/schema/category.schema';
import {Transform} from 'class-transformer';
import {IsNotEmpty, Allow} from 'class-validator';
import {Model} from 'mongoose';

export class createDto {
  @IsNotEmpty()
  name: string;
  @Allow()
  description: string;
}

export class getAllDto {
  @Allow()
  sortType: string;

  @Allow()
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
  fields: string;
}

export interface categoryModel extends Model<Category> {
  paginate: any;
}
