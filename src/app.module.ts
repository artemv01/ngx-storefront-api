import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module';
import {ShopModule} from './shop/shop.module';
import {environment} from '@env/environment';
import {join} from 'path';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost/webshoptest', {
      connectionFactory: connection => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-unique-validator'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-paginate'));
        return connection;
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environment],
    }),

    ShopModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
