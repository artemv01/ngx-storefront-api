import {Controller, Request, Post, UseGuards, Body, HttpException} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {AuthService} from './auth.service';
import {hash} from 'bcrypt';
import {IsEmail, IsNotEmpty, MinLength} from 'class-validator';
import {User} from '../schema/user.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';

class registerDto {
  @IsEmail(
    {},
    {
      message: 'Email is in incorrect format',
    }
  )
  email: string;

  @IsNotEmpty()
  @MinLength(8, {message: 'Password must be longer than or equal to $constraint1 characters'})
  password: string;
}

class loginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, @InjectModel(User.name) private userModel: Model<User>) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() req: registerDto) {
    let hashed = await hash(req.password, 12);
    let result = await this.userModel.create({
      email: req.email,
      password: hashed,
    });
    if (!result) {
      throw new HttpException(null, 500);
    }
  }
}
