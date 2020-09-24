import {plainToClass} from 'class-transformer';
import {IsNotEmpty, Allow, IsEmail, ValidateNested} from 'class-validator';
import {Model} from 'mongoose';
import {Transform} from 'class-transformer';
import {Order} from '@app/schema/order.schema';

export class Address {
  @IsNotEmpty()
  address_line1: string;

  @Allow()
  address_line2: string;

  @IsNotEmpty()
  zip: string;

  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  city: string;

  @Allow()
  state: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;
}

export class createOrderDto {
  @IsNotEmpty()
  @Transform(pojo => plainToClass(Address, pojo))
  @ValidateNested()
  shippingAddress: Address;

  @IsNotEmpty()
  @Transform(pojo => plainToClass(Address, pojo))
  @ValidateNested()
  billingAddress: Address;

  @IsNotEmpty()
  cart: Record<string, number>;

  @Allow()
  notes: string;
}

export class ProductInCart {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  price: number;
  @IsNotEmpty()
  onSale: boolean;
  @IsNotEmpty()
  image: string;
  @IsNotEmpty()
  originalId: string;
}
export class CartItem {
  @IsNotEmpty()
  @Transform(pojo => plainToClass(ProductInCart, pojo))
  @ValidateNested()
  product: ProductInCart;

  @IsNotEmpty()
  quantity: number;
}
export class editOrderDto {
  @Transform(pojo => plainToClass(Address, pojo))
  @ValidateNested()
  shippingAddress: Address;

  @Transform(pojo => plainToClass(Address, pojo))
  @ValidateNested()
  billingAddress: Address;
  status: string;

  @Transform(pojo => plainToClass(CartItem, pojo))
  @ValidateNested()
  cart: [CartItem];
}

export class ChangeStatusDto {
  @IsNotEmpty()
  status: string;
  @IsNotEmpty()
  orders: string[];
}

export class getAllDto {
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
}

export interface orderModel extends Model<Order> {
  paginate: any;
}
