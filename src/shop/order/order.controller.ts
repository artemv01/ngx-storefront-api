import {Controller, Body, Post, Query, Get, NotFoundException, Param, Delete, UseGuards, Patch} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Product} from '@app/schema/product.schema';
import {Model} from 'mongoose';
import {Order} from '@app/schema/order.schema';
import {AuthGuard} from '@nestjs/passport';
import {ChangeStatusDto, createOrderDto, CartItem, editOrderDto, getAllDto, orderModel} from './order.types';

@Controller('orders')
export class OrderController {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: orderModel
  ) {}

  @Patch('change-order-status')
  @UseGuards(AuthGuard('jwt'))
  async changeStatus(@Body() req: ChangeStatusDto): Promise<void> {
    for (const orderId of req.orders) {
      await this.orderModel.findByIdAndUpdate(orderId, {
        status: req.status,
      });
    }
  }

  @Post()
  async create(@Body() req: createOrderDto): Promise<void> {
    const newOrder = new this.orderModel();

    newOrder.shippingAddress = req.shippingAddress;
    newOrder.billingAddress = req.billingAddress;
    newOrder.notes = req.notes;

    for (const [_id, quantity] of Object.entries(req.cart)) {
      const product = await this.productModel.findById(_id);
      if (!product) {
        continue;
      }
      const newCartItem: CartItem = {} as CartItem;
      let price = 0;

      if (!product) {
        continue;
      }

      price = product.onSale ? product.salePrice : product.price;
      newOrder.total += price * quantity;

      newCartItem.product = {
        name: product.name,
        description: product.description,
        onSale: product.onSale,
        image: product.image,
        price: price,
        originalId: product._id,
      };
      newCartItem.quantity = quantity;
      newOrder.cart.push(newCartItem);
    }

    const created = await newOrder.save();
    return created._id;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async edit(@Body() req: editOrderDto, @Param('id') id): Promise<void> {
    const order = await this.orderModel.findById(id).exec();
    const newOrderData = {
      shippingAddress: req.shippingAddress ? req.shippingAddress : order.shippingAddress,
      billingAddress: req.billingAddress ? req.billingAddress : order.billingAddress,
      cart: order.cart,
      total: order.total,
      status: req.status ? req.status : order.status,
    };

    if (req.cart && Object.keys(req.cart).length) {
      newOrderData.cart = req.cart;

      newOrderData.total = 0;
      for (const item of req.cart) {
        newOrderData.total += item.product.price * item.quantity;
      }
    }

    const updated = await order.update(newOrderData);
    if (!updated) {
      throw new NotFoundException();
    }
    return updated._id;
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getAll(@Query() query: getAllDto): Promise<any> {
    let paginationConfig = {};
    if (!query.page) {
      paginationConfig = {
        limit: 10,
        page: 1,
      };
    } else {
      paginationConfig = {
        limit: query.limit,
        page: query.page,
      };
    }

    let search = {};
    let searchStr;
    if (query.search) {
      searchStr = `${query.search}`;
      search = {
        $or: [
          {
            name: new RegExp(searchStr, 'i'),
          },
          {
            description: new RegExp(searchStr, 'i'),
          },
        ],
      };
    }
    const itemsPaginate = await this.orderModel.paginate(search, {
      ...paginationConfig,
      select: '-cart.id -__v',
      sort: {[query.sortType]: query.sortOrder},
    });

    const {total, limit, page, pages, docs} = itemsPaginate;
    return {items: docs, total, limit, page, pages};
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getOne(@Param('id') id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .select('-cart._id -__v')
      .exec();
    if (!order) {
      throw new NotFoundException();
    }

    return order.toObject();
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException();
    }
  }
}
