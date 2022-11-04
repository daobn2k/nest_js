import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService) {}

  async getHello(lang: string): Promise<string> {
    const message: string = await this.i18n.t('app.hello', { lang });

    return message;
  }
}
