import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Model, Types} from 'mongoose';
import {Review} from './review.schema';
import {ProductCategory} from './product-category.schema';
import {Category} from './category.schema';

@Schema({
  timestamps: true,
  strict: true,
})
export class Product extends Document {
  @Prop({
    index: 'text',
    sparse: true,
  })
  name: string;

  @Prop({
    index: 'text',
    sparse: true,
  })
  description: string;

  @Prop({
    default: 0,
  })
  price: number;

  @Prop({
    default: 0,
  })
  salePrice: number;

  @Prop({
    default: false,
  })
  onSale: boolean;

  @Prop({
    default: 0,
  })
  rating: number;

  @Prop({
    default: 0,
  })
  ratingCount: number;

  @Prop()
  image: string;

  @Prop({type: [Types.ObjectId], default: []})
  relatedProducts: string[];

  getReviews: () => any;
  getCategories: () => any;
}
export const ProductSchema = SchemaFactory.createForClass(Product);

export const ProductSchemaFactory = (
  reviewModel: Model<Review>,
  productCategoryModel: Model<ProductCategory>,
  categoryModel: Model<Category>
) => {
  ProductSchema.method('getReviews', function() {
    return reviewModel
      .find({productId: this.id})
      .lean()
      .exec();
  });

  ProductSchema.methods.getCategories = async function() {
    const categories = await productCategoryModel
      .find({product: this._id})
      .select('category')
      .lean()
      .exec();

    let catIds = [];
    categories.forEach(cat => {
      catIds.push(cat.category);
    });
    return await categoryModel
      .find({_id: {$in: catIds}})
      .select('name _id')
      .lean()
      .exec();
  };

  return ProductSchema;
};
