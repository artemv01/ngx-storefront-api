import {Module} from '@nestjs/common';
import {ProductController} from './product/product.controller';
import {ProductSchemaFactory, Product} from '@app/schema/product.schema';
import {MongooseModule, getModelToken} from '@nestjs/mongoose';
import {ReviewController} from './review/review.controller';
import {ReviewSchemaFactory, Review} from '@app/schema/review.schema';
import {Order, OrderSchema} from '@app/schema/order.schema';
import {OrderController} from './order/order.controller';
import {CategoryController} from './category/category.controller';
import {Category, CategorySchemaFactory} from '@app/schema/category.schema';
import {ProductCategory, ProductCategorySchemaFactory} from '@app/schema/product-category.schema';
import {UploaderService} from '@app/service/uploader/uploader.service';

@Module({
  imports: [
    // MulterModule.register({dest: '../../uploads'}),
    MongooseModule.forFeature([{name: Order.name, schema: OrderSchema}]),
    MongooseModule.forFeatureAsync([
      {name: Review.name, useFactory: ReviewSchemaFactory},
      {name: Category.name, useFactory: CategorySchemaFactory, inject: [getModelToken(Review.name)]},
      {
        name: ProductCategory.name,
        useFactory: ProductCategorySchemaFactory,
        inject: [],
      },
      {
        name: Product.name,
        useFactory: ProductSchemaFactory,
        inject: [getModelToken(Review.name), getModelToken(ProductCategory.name), getModelToken(Category.name)],
      },
    ]),
  ],
  controllers: [ProductController, ReviewController, OrderController, CategoryController],
  providers: [UploaderService],
})
export class ShopModule {}
