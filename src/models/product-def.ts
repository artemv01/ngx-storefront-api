import {CategoryDef} from './category-def';

export interface ProductDef {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number;
  onSale: boolean;
  rating: number;
  ratingCount: number;
  image: string;
  relatedProducts: string[];
  categories?: Partial<CategoryDef>[];
}
