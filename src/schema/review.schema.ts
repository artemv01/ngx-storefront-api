import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

@Schema({strict: true, timestamps: true})
export class Review extends Document {
  @Prop()
  authorName: string;
  @Prop()
  authorEmail: string;
  @Prop()
  rating: number;
  @Prop()
  content: string;

  @Prop()
  productName?: string;

  @Prop({
    ref: 'Product',
    type: Types.ObjectId,
  })
  productId: string;
}

const ReviewSchema = SchemaFactory.createForClass(Review);
export const ReviewSchemaFactory = () => ReviewSchema;
