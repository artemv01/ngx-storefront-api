import {CartItem, OrderStatus} from '@app/shop/order/order.types';
import {Prop, Schema, SchemaFactory, raw} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

@Schema({
  timestamps: true,
  strict: true,
})
export class Order extends Document {
  @Prop({
    default: 0,
  })
  total: number;

  @Prop(
    raw({
      address_line1: String,
      address_line2: String,
      zip: Number,
      country: String,
      city: String,
      state: String,
      email: String,
      phone: String,
      first_name: String,
      last_name: String,
    })
  )
  billingAddress: Record<string, any>;

  @Prop(
    raw({
      address_line1: String,
      address_line2: String,
      zip: Number,
      country: String,
      city: String,
      state: String,
      email: String,
      phone: String,
      first_name: String,
      last_name: String,
    })
  )
  shippingAddress: Record<string, any>;

  @Prop({
    type: String,
    enum: ['pending', 'completed', 'on_hold'],
    default: 'pending',
  })
  status: OrderStatus;

  @Prop()
  notes: string;

  @Prop(
    raw([
      {
        quantity: Number,
        product: {
          name: String,
          description: String,
          price: Number,
          onSale: Boolean,
          image: String,
          originalId: Types.ObjectId,
        },
      },
    ])
  )
  cart: CartItem[];
}
export const OrderSchema = SchemaFactory.createForClass(Order);
