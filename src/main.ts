import './config/aliases';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestApplicationOptions, ValidationPipe} from '@nestjs/common';
import {config} from 'aws-sdk';
import {ConfigService} from '@nestjs/config';
import fs from 'fs';

const key = '/home/ubuntu/.secret/privkey.pem';
const cert = '/home/ubuntu/.secret/fullchain.pem';
interface HttpsOpts {
  key?: string;
  cert?: string;
}
const opts: NestApplicationOptions = {};
/* if (fs.existsSync(key) && fs.existsSync(cert)) {
  opts.httpsOptions.key = key;
  opts.httpsOptions.cert = cert;
} */

async function bootstrap() {
  const app = await NestFactory.create(AppModule, opts);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {target: false},
      transform: true,
    })
  );
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('FRONTEND_APP_URL'),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY'),
    secretAccessKey: configService.get('AWS_SECRET_KEY'),
    region: configService.get('AWS_REGION'),
  });
  await app.listen(configService.get('PORT') || 4500);
}
bootstrap();
