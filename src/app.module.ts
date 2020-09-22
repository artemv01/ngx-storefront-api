import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module';
import {ShopModule} from './shop/shop.module';
import {UploaderService} from './service/uploader/uploader.service';

/* const s3Factory = {
  provide: 'S3',
  useFactory: () => {
    const config = {
      credentials: {
        accessKeyId: process.env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: 'us-west-2',
    }
  }
} */

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_CONN, {
      connectionFactory: connection => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-unique-validator'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-paginate'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-aggregate-paginate-v2'));

        return connection;
      },
    }),

    ShopModule,
  ],
  controllers: [AppController],
  providers: [AppService, UploaderService],
})
export class AppModule {}
