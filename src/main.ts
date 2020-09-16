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
  app.enableCors({
    origin: [process.env.APP_URL],
    credentials: true,
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
