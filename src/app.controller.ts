import { MailService } from '@modules/mail/mail.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private mailService: MailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  getHello(@I18n() i18n: I18nContext): Promise<string> {
    return this.appService.getHello(i18n.lang);
  }

  @ApiOperation({ summary: 'Send email feature' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', default: 'huy.nn@hesperiafreepress.com' },
      },
    },
  })
  @Post('mailer')
  mailer(@Body() { email }: { email: string }): Promise<void> {
    return this.mailService.helloMail(email);
  }
}
