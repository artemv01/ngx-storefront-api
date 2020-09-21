import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema, User} from '../schema/user.schema';
import {LocalStrategy} from './local.strategy';
import {AuthController} from './auth.controller';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';
import {PassportModule} from '@nestjs/passport';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    PassportModule.register({defaultStrategy: 'jwt'}),
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: process.env.JWT_EXPIRE},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
