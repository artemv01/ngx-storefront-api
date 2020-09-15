import {NestFactory} from '@nestjs/core';
import {AdminSeederService} from './admin-seeder/admin-seeder.service';
import {ProductSeederService} from './product-seeder/product-seeder.service';
import {SeedersModule} from './seeders.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedersModule);
  const products = app.get(ProductSeederService);
  const admins = app.get(AdminSeederService);
  await products.create();
  await admins.create();
  await app.close();
}
bootstrap();
