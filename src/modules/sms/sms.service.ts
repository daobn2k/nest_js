import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: Twilio;

  constructor(private readonly config: ConfigService) {
    const accountSid: string = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken: string = this.config.get<string>('TWILIO_AUTH_TOKEN');

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async initiatePhoneNumberVerification(phoneNumber: string): Promise<boolean> {
    const serviceSid: string = this.config.get<string>(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );

    const result = await this.twilioClient.verify
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    return result.status === 'pending';
  }

  async confirmPhoneNumber(
    phoneNumber: string,
    code: string,
  ): Promise<boolean> {
    const serviceSid: string = this.config.get<string>(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );

    const result = await this.twilioClient.verify
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code });

    if (!result.valid || result.status !== 'approved') {
      return false;
    }

    return true;
  }
}
