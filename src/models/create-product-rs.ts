import {Product} from '@app/schema/product.schema';
import {ProductModel} from '@app/shop/product/product.types';

export interface CreateProductRS extends ProductModel {
  categories: {name: string; _id: string}[];
}
