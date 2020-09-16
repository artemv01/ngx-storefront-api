import {Category} from '@app/schema/category.schema';
import {ProductCategory} from '@app/schema/product-category.schema';
import {Product} from '@app/schema/product.schema';
import {Review} from '@app/schema/review.schema';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';

import {products} from '@app/seeders/product-seeder/products';

@Injectable()
export class ProductSeederService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(ProductCategory.name) private productCategoryModel: Model<ProductCategory>
  ) {}

  public async create() {
    for (const product of products) {
      const {categories, ...data} = product;
      const createdProduct = await this.productModel.create(data as Product);
      if (!createdProduct) {
        throw new Error('Could not create item');
      }
      for (const category of categories) {
        const isExisting = await this.categoryModel.findOne({name: category});
        if (isExisting) {
          const connect = await this.productCategoryModel.create({
            product: createdProduct._id,
            category: isExisting._id,
          });
        } else {
          const createdCategory = await this.categoryModel.create({name: category});
          const connect = await this.productCategoryModel.create({
            product: createdProduct._id,
            category: createdCategory._id,
          });
        }
      }
    }
  }
}
