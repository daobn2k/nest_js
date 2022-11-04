import User from '@modules/user/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { getNameUser } from '@utils/get-name-user';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async helloMail(to: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: 'confirmation',
      context: {
        name: 'Huy',
        url: 'https://www.google.com/',
      },
    });
  }

  async forgotPassword(user: User, token: string, lang: string): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Forgot password',
      template: 'confirmation',
      context: {
        name: getNameUser(user),
        url: 'https://www.google.com/', // redirect to reset password page with ?token=jwt
      },
    });
  }

  async otp({ code, email }: { code: string; email: string }): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Maby!',
      template: 'otp',
      context: {
        email,
        code,
      },
    });
  }
}
