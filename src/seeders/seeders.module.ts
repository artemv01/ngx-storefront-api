import {AppController} from '@app/app.controller';
import {AppService} from '@app/app.service';
import {Category, CategorySchemaFactory} from '@app/schema/category.schema';
import {Order, OrderSchema} from '@app/schema/order.schema';
import {ProductCategory, ProductCategorySchemaFactory} from '@app/schema/product-category.schema';
import {Product, ProductSchemaFactory} from '@app/schema/product.schema';
import {Review, ReviewSchemaFactory} from '@app/schema/review.schema';
import {User, UserSchema} from '@app/schema/user.schema';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {getModelToken, MongooseModule} from '@nestjs/mongoose';
import {PassportModule} from '@nestjs/passport';
import {environment} from '@root/environments/environment';
import {AdminSeederService} from './admin-seeder/admin-seeder.service';
import {ProductSeederService} from './product-seeder/product-seeder.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/webshoptest', {
      connectionFactory: connection => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-unique-validator'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-paginate'));
        return connection;
      },
    }),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
        signOptions: {expiresIn: configService.get('jwtExpire')},
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
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
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environment],
    }),
    SeedersModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProductSeederService, AdminSeederService],
})
export class SeedersModule {}
