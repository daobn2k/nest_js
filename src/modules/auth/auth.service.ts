import { DeviceService } from '@modules/device/device.service';
import { MailService } from '@modules/mail/mail.service';
import NotificationTopic from '@modules/notification/entities/notificationTopic.entity';
import { Topics } from '@modules/notification/notification.constant';
import { NotificationService } from '@modules/notification/notification.service';
import { SmsService } from '@modules/sms/sms.service';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import User from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { Facebook, FacebookInterface } from 'fb';
import { Auth, google, oauth2_v2 } from 'googleapis';
import { I18nService } from 'nestjs-i18n';
import { UpdateResult } from 'typeorm';
import { AuthFacebookDto } from './dto/auth-facebook.dto';
import { AuthGoogleDto } from './dto/auth-google.dto';
import { LoginDto, LoginResponse, LogoutDto } from './dto/auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private oauthGoogleClient: Auth.OAuth2Client;
  private oauthFacebookClient: any;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
    private readonly deviceService: DeviceService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly smsService: SmsService,
    private readonly config: ConfigService,
  ) {
    this.oauthGoogleClient = new google.auth.OAuth2({
      clientId: this.config.get('GOOGLE_CLIENT_ID'),
      clientSecret: this.config.get('GOOGLE_SECRET'),
    });

    this.oauthFacebookClient = new Facebook({
      appId: this.config.get('FACEBOOK_CLIENT_ID'),
      appSecret: this.config.get('FACEBOOK_SECRET'),
    });
  }

  expiredDay(day: number): number {
    return new Date().setDate(new Date().getDate() + day);
  }

  async registerNotification(fcmToken: string, user: User) {
    if (fcmToken) {
      this.deviceService.create(fcmToken, user);
      this.notificationService.subcribeToTopic(fcmToken, Topics.ALL);

      const userTopics: NotificationTopic[] =
        await this.notificationService.findTopicByUser(user);

      await Promise.all(
        userTopics.map((topic: NotificationTopic) => {
          this.notificationService.subcribeToTopic(fcmToken, topic.name);
        }),
      );
    }
  }

  async generateToken(
    user: User,
    extra?: { google_id?: string; facebook_id?: string },
  ): Promise<LoginResponse> {
    const payload: { id: number; email: string } = {
      id: user.id,
      email: user.email,
    };

    const token: string = this.jwtService.sign(payload);

    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_KEY_REFRESH'),
      expiresIn: this.expiredDay(14),
    });

    const expiredTime: number = this.expiredDay(7);

    await this.userService.updateRefreshToken(user.id, refreshToken, extra);

    return {
      token,
      expired_time: expiredTime,
      refresh_token: refreshToken,
    };
  }

  async register(
    { fcm_token, ...payload }: CreateUserDto,
    lang: string,
  ): Promise<LoginResponse> {
    const user: User = await this.userService.create(payload, lang);

    await this.registerNotification(fcm_token, user);

    return await this.generateToken(user);
  }

  async login(
    { email, password, fcm_token }: LoginDto,
    lang: string,
  ): Promise<LoginResponse> {
    const user: User = await this.userService.findByEmail(email, lang);

    const isValidPassword: boolean = await this.userService.comparePassword(
      user.id,
      password,
    );

    if (!isValidPassword) {
      const message: string = await this.i18n.t('auth.password.wrong', {
        lang,
      });

      throw new BadRequestException(message);
    }

    await this.registerNotification(fcm_token, user);

    return await this.generateToken(user);
  }

  async loginGoolge(
    { access_token, fcm_token }: AuthGoogleDto,
    lang: string,
  ): Promise<LoginResponse> {
    try {
      await this.oauthGoogleClient.getTokenInfo(access_token);

      const userInfo: oauth2_v2.Resource$Userinfo =
        google.oauth2('v2').userinfo;

      this.oauthGoogleClient.setCredentials({
        access_token,
      });

      const { data: info } = await userInfo.get({
        auth: this.oauthGoogleClient,
      });

      let user: User = await this.userService.findByCondition({
        email: info.email,
      });

      if (user) {
        await this.registerNotification(fcm_token, user);

        return await this.generateToken(user, { google_id: info.id });
      }

      /**
       * Create new user
       */

      const {
        email,
        given_name: first_name = '',
        family_name: last_name = '',
        id = '',
      } = info;

      user = await this.userService.createByGoogle({
        email,
        first_name,
        last_name,
        google_id: id,
      });

      await this.registerNotification(fcm_token, user);

      return await this.generateToken(user);
    } catch (error) {
      const message: string = await this.i18n.t('auth.not_found_user_google', {
        lang,
      });

      throw new NotFoundException(message);
    }
  }

  async loginFacebook(
    { access_token, fcm_token }: AuthFacebookDto,
    lang: string,
  ): Promise<LoginResponse> {
    try {
      this.oauthFacebookClient.setAccessToken(access_token);

      const info: FacebookInterface = await this.oauthFacebookClient.api(
        '/me',
        'get',
        { fields: 'id,last_name,email,first_name' },
      );

      let user: User = await this.userService.findByCondition({
        email: info.email,
      });

      if (user) {
        await this.registerNotification(fcm_token, user);

        return await this.generateToken(user, { facebook_id: info.facebookId });
      }

      /**
       * Create new user
       */

      const {
        email,
        first_name: first_name = '',
        last_name: last_name = '',
        id = '',
      } = info;

      user = await this.userService.createByFacebook({
        email,
        first_name,
        last_name,
        facebook_id: id,
      });

      await this.registerNotification(fcm_token, user);

      return await this.generateToken(user);
    } catch (error) {
      const message: string = await this.i18n.t(
        'auth.not_found_user_facebook',
        {
          lang,
        },
      );

      throw new NotFoundException(message);
    }
  }

  async refresh(
    { refresh_token }: RefreshTokenDto,
    lang: string,
  ): Promise<LoginResponse> {
    try {
      const verified: { id: number; email: string; iat: number; exp: number } =
        await this.jwtService.verify(refresh_token, {
          secret: this.config.get<string>('JWT_KEY_REFRESH'),
        });

      const user: User = await this.userService.findByRefreshToken(
        verified.id,
        refresh_token,
        lang,
      );

      return await this.generateToken(user);
    } catch (error) {
      const message: string = await this.i18n.t('auth.refresh_token.invalid', {
        lang,
      });

      throw new NotAcceptableException(message);
    }
  }

  async forgotPassword(
    { email }: ForgotPasswordDto,
    lang: string,
  ): Promise<string> {
    const user: User = await this.userService.findByEmail(email, lang);

    const token: string = this.jwtService.sign(
      { id: user.id, email: user.email },
      { secret: this.config.get('JWT_KEY'), expiresIn: '30m' },
    );

    await this.mailService.forgotPassword(user, token, lang);

    return token;
  }

  async resetPassword(
    { token, password }: ResetPasswordDto,
    lang: string,
  ): Promise<boolean> {
    try {
      const verified: { id: number; email: string; iat: number; exp: number } =
        await this.jwtService.verify(token, {
          secret: this.config.get('JWT_KEY'),
        });

      return await this.userService.resetPassword(verified.id, password, lang);
    } catch (error) {
      const message: string = await this.i18n.t('auth.refresh_token.invalid', {
        lang,
      });

      throw new NotAcceptableException(message);
    }
  }

  async logout({ fcm_token }: LogoutDto, user: User): Promise<UpdateResult> {
    if (fcm_token) {
      this.deviceService.remove(fcm_token, user);
      this.notificationService.unsubscribeFromTopic(fcm_token, Topics.ALL);

      const userTopics: NotificationTopic[] =
        await this.notificationService.findTopicByUser(user);

      await Promise.all(
        userTopics.map((topic: NotificationTopic) => {
          this.notificationService.unsubscribeFromTopic(fcm_token, topic.name);
        }),
      );
    }

    return await this.userService.updateRefreshToken(user.id, '');
  }
}
