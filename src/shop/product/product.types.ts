import {ProductCategory} from '@app/schema/product-category.schema';
import {Product} from '@app/schema/product.schema';
import {Transform} from 'class-transformer';
import {IsNotEmpty, Allow, ValidateIf} from 'class-validator';
import {Model} from 'mongoose';

export class createProductDto {
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

export class getAllDto {
  @IsNotEmpty()
  sortType: string;

  @IsNotEmpty()
  sortOrder: string;

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
export class bulkDeleteDto {
  @IsNotEmpty()
  productIds: string[];
}

export interface ProductModel extends Model<Product> {
  paginate: any;
  aggregatePaginate: any;
}
export interface ProductCategoryModel extends Model<ProductCategory> {
  paginate: any;
}
