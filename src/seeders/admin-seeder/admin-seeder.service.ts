import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {hash} from 'bcrypt';
import {User} from '@app/schema/user.schema';

import {admins} from './admins';

@Injectable()
export class AdminSeederService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public async create() {
    for (const admin of admins) {
      let hashed = await hash(admin.password, 12);
      let result = await this.userModel.create({
        email: admin.email,
        password: hashed,
      });
    }
  }
}
