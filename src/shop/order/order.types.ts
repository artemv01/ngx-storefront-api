import {plainToClass} from 'class-transformer';
import {IsNotEmpty, Allow, IsEmail, ValidateNested} from 'class-validator';
import {Model} from 'mongoose';
import {Transform} from 'class-transformer';
import {Order} from '@app/schema/order.schema';

class Address {
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
  @IsEmail({
    require_tld: false,
  })
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

  @IsNotEmpty()
  captcha: string;
}

interface ProductInCart {
  name: string;
  description: string;
  price: number;
  onSale: boolean;
  image: string;
  originalId: string;
}
export interface CartItem {
  product: ProductInCart;
  quantity: number;
}
export class editOrderDto {
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

  @Allow()
  status: string;
}

export class ChangeStatusDto {
  @IsNotEmpty()
  status: string;
  @IsNotEmpty()
  orders: string[];
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
}

export interface orderModel extends Model<Order> {
  paginate: any;
  aggregatePaginate: any;
}
