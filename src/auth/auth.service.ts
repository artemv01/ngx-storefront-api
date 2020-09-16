import {Injectable} from '@nestjs/common';
import {compare} from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import {User} from '../schema/user.schema';
import {Model} from 'mongoose';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({email: email});
    if (!user) {
      return null;
    }
    return compare(pass, user.password)
      .then(result => {
        if (!result) {
          return null;
        }
        return {userId: user._id};
      })
      .catch(() => null);
  }

  async login(user: any) {
    return {
      access_token: this.jwtService.sign({
        sub: user.userId,
      }),
      expires_in: process.env.JWT_EXPIRE,
    };
  }
}
