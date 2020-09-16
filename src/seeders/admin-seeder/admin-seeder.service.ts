import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {hash} from 'bcrypt';
import {User} from '@app/schema/user.schema';

@Injectable()
export class AdminSeederService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public async create() {
    let hashed = await hash(process.env.ADMIN_PASSWORD, 12);
    let result = await this.userModel.create({
      email: process.env.ADMIN_EMAIL,
      password: hashed,
    });
  }
}
