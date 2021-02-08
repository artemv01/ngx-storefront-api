import {CartItem} from '@app/shop/order/order.types';

export interface OrderDef {
  total: number;
  billingAddress: Record<string, any>;
  shippingAddress: Record<string, any>;
  cart: CartItem[];
  createdAt: string;
  updatedAt: string;
}
