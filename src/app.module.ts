import { ApiModule } from '@modules/api/api.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ChatModule } from '@modules/chat/chat.module';
import { DatabaseModule } from '@modules/database/database.module';
import { DeviceModule } from '@modules/device/device.module';
import { FaqModule } from '@modules/faq/faq.module';
import { FileModule } from '@modules/file/file.module';
import { MailModule } from '@modules/mail/mail.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { PermissionModule } from '@modules/permission/permission.module';
import { RoleModule } from '@modules/role/role.module';
import { SmsModule } from '@modules/sms/sms.module';
import { TaskModule } from '@modules/task/task.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestModule } from './modules/request/request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UserModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    FileModule,
    TaskModule,
    MailModule,
    FaqModule,
    ChatModule,
    ApiModule,
    NotificationModule,
    DeviceModule,
    SmsModule,
    RequestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
