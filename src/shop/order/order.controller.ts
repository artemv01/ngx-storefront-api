import {
  Controller,
  Body,
  Post,
  Query,
  Get,
  NotFoundException,
  Param,
  Delete,
  UseGuards,
  Patch,
  HttpException,
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Product} from '@app/schema/product.schema';
import {Model, Types} from 'mongoose';
import {Order} from '@app/schema/order.schema';
import {AuthGuard} from '@nestjs/passport';
import {
  ChangeStatusDto,
  createOrderDto,
  CartItem,
  editOrderDto,
  getAllDto,
  bulkDeleteDto,
  OrderModel,
  OrderStatus,
} from './order.types';
import {ApiService} from '@app/service/api/api.service';

@Controller('order')
export class OrderController {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: OrderModel,
    private api: ApiService
  ) {}

  @Patch('change-order-status')
  @UseGuards(AuthGuard('jwt'))
  async changeStatus(@Body() req: ChangeStatusDto): Promise<string> {
    for (const orderId of req.orders) {
      await this.orderModel.findByIdAndUpdate(orderId, {
        status: req.status,
      });
    }
    return JSON.stringify(req.status);
  }

  @Patch('bulk-delete')
  @UseGuards(AuthGuard('jwt'))
  async bulkDelete(@Body() items: bulkDeleteDto): Promise<void> {
    this.orderModel.deleteMany({_id: {$in: items.itemIds}}).exec();
  }

  @Post()
  async create(@Body() req: createOrderDto): Promise<Types.ObjectId> {
    const captchaResult = await this.api.verifyCaptcha(req.captcha);
    if (!captchaResult.data.success) {
      throw new HttpException(captchaResult.data['error-codes'], 400);
    }
    const newOrder = new this.orderModel();

    newOrder.shippingAddress = req.shippingAddress;
    newOrder.billingAddress = req.billingAddress;
    newOrder.notes = req.notes;
    newOrder.total = 0;
    for (const [_id, quantity] of Object.entries(req.cart)) {
      const product = await this.productModel.findById(_id);
      if (!product) {
        continue;
      }

      let price = 0;
      price = product.onSale ? product.salePrice : product.price;
      newOrder.total += price * quantity;

      const newCartItem: CartItem = {} as CartItem;
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
  async edit(@Body() req: editOrderDto, @Param('id') id): Promise<Order> {
    // **
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException();
    }
    const newOrderData: Partial<Order> = {
      shippingAddress: req.shippingAddress ? req.shippingAddress : order.shippingAddress,
      billingAddress: req.billingAddress ? req.billingAddress : order.billingAddress,
      cart: order.cart,
      total: order.total,
      status: req.status ? req.status : order.status,
      notes: req.notes ? req.notes : order.notes,
    };

    if (req.cartUpdateRQ && Object.keys(req.cartUpdateRQ).length) {
      newOrderData.cart = [];
      newOrderData.total = 0;

      for (const [_id, quantity] of Object.entries(req.cartUpdateRQ)) {
        const product = await this.productModel.findById(_id);
        if (!product) {
          continue;
        }

        let price = 0;
        price = product.onSale ? product.salePrice : product.price;
        newOrderData.total += price * quantity;

        const newCartItem: CartItem = {} as CartItem;
        newCartItem.product = {
          name: product.name,
          description: product.description,
          onSale: product.onSale,
          image: product.image,
          price: price,
          originalId: product._id,
        };
        newCartItem.quantity = quantity;

        newOrderData.cart.push(newCartItem);
      }
    }

    // const updated = await order.update(newOrderData);
    const updated = await this.orderModel.findByIdAndUpdate(id, newOrderData, {new: true});
    return updated;
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

    let filter: any = {};
    let searchStr;
    if (query.search) {
      searchStr = `${query.search}`;
      filter = {
        $or: [
          {
            shippingFullName: new RegExp(searchStr, 'i'),
          },
          {
            billingFullName: new RegExp(searchStr, 'i'),
          },
          {
            'shippingAddress.email': new RegExp(searchStr, 'i'),
          },
          {
            'billingAddress.email': new RegExp(searchStr, 'i'),
          },
        ],
      };
    }

    const sortType = query.sortType ? query.sortType : 'createdAt';
    const sortOrder = query.sortOrder ? query.sortOrder : 'desc';

    const aggregation: any = [
      {
        $addFields: {
          shippingFullName: {$concat: ['$shippingAddress.first_name', ' ', '$shippingAddress.last_name']},
          billingFullName: {$concat: ['$billingAddress.first_name', ' ', '$billingAddress.last_name']},
        },
      },
      {$match: filter},
      {$sort: {[sortType]: sortOrder === 'asc' ? 1 : -1}},
      {
        $project: {
          shippingFullName: false,
          billingFullName: false,
        },
      },
    ];

    const agg = this.orderModel.aggregate(aggregation);
    const paginateResult = await this.orderModel.aggregatePaginate(agg, paginationConfig);
    const {totalDocs, limit, page, totalPages} = paginateResult;
    return {
      items: paginateResult.docs,
      total: totalDocs,
      limit,
      page,
      pages: totalPages,
    };
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
