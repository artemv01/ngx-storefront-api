import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema, User} from '../schema/user.schema';
import {LocalStrategy} from './local.strategy';
import {AuthController} from './auth.controller';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';
import {PassportModule} from '@nestjs/passport';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
        signOptions: {expiresIn: configService.get('jwtExpire')},
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
