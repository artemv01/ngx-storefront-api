import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Model, Types} from 'mongoose';
import {Product} from './product.schema';

@Schema({
  timestamps: true,
  strict: true,
})
export class Category extends Document {
  @Prop({
    required: true,
  })
  name: string;

  @Prop()
  description?: string;

  getItems: () => [Product];
  countItems: () => [Product];
}
const CategorySchema = SchemaFactory.createForClass(Category);

export const CategorySchemaFactory = (productModel: Model<Product>) => {
  CategorySchema.method('getItems', function() {
    return productModel
      .find({categoryId: this.id})
      .lean()
      .exec();
  });
  CategorySchema.method('countItems', function() {
    return productModel
      .countDocuments({categoryId: this.id})
      .lean()
      .exec();
  });

  return CategorySchema;
};
