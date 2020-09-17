import './config/aliases';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {target: false},
      transform: true,
    })
  );
  app.enableCors(/* {
    origin: ['*'],
    credentials: true,
  } */);
  await app.listen(process.env.PORT || 4500);
}
bootstrap();
