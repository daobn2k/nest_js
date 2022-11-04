import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@utils/http-exception.filter';
import { config as awsSdkConfig } from 'aws-sdk';
import 'dotenv/config';
import {
  i18nValidationErrorFactory,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';
// import { join } from 'path';
import { ErrorsInterceptor } from '@interceptors/error.interceptor';
import { LoggerInterceptor } from '@interceptors/logger.interceptor';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';

const serviceAccount = require('../serviceAccountKey');

async function bootstrap(): Promise<void> {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ exceptionFactory: i18nValidationErrorFactory }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
  );
  app.useGlobalInterceptors(new LoggerInterceptor(), new ErrorsInterceptor());

  const config: ConfigService<unknown, boolean> = app.get(ConfigService);

  awsSdkConfig.update({
    accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID'),
    secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY'),
    region: config.get<string>('AWS_REGION'),
  });

  const configSwagger: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Base')
    .setDescription('')
    .setVersion('1.0')
    .addTag('auth')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(
    app,
    configSwagger,
  );

  SwaggerModule.setup('api', app, document);

  /**
   * To test websockets chat
   * ${APP_URL}:${PORT}
   * Note: Change url at static/main.js line:29 to match with nest app url
   */
  // app.useStaticAssets(join(__dirname, '..', 'static'));

  const port: number = +config.get<string>('PORT');

  await app.listen(port);

  Logger.log(
    `🚀 ~ App running at ${config.get<string>('APP_URL')}:${port}/api`,
    'NestApplication',
  );
}

bootstrap();
