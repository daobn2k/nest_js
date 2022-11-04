import { DeviceModule } from '@modules/device/device.module';
import { MailModule } from '@modules/mail/mail.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { SmsModule } from '@modules/sms/sms.module';
import { UserModule } from '@modules/user/user.module';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@strategies/jwt.strategy';
import * as redisStore from 'cache-manager-redis-store';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_KEY'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
    MailModule,
    NotificationModule,
    DeviceModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get<string>('REDIS_HOST'),
        port: config.get<string>('REDIS_PORT'),
      }),
    }),
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
