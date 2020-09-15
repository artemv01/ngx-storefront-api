import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Model, Types} from 'mongoose';
import {Category} from './category.schema';
import {Product} from './product.schema';

@Schema({
  timestamps: false,
  strict: true,
})
export class ProductCategory extends Document {
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  category: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  product: Types.ObjectId;

  getCategory: () => any;
  getProduct: () => any;
}
const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);

export const ProductCategorySchemaFactory = (/* categoryModel: Model<Category>, productModel: Model<Product> */) => {
  /*  ProductCategorySchema.methods.getCategory = function() {
    return categoryModel
      .findById(this.category)
      .lean()
      .exec();
  };
  ProductCategorySchema.methods.getProduct = function() {
    return productModel
      .findById(this.product)
      .lean()
      .exec();
  }; */

  return ProductCategorySchema;
};
