import { Auth } from '@decorators/roles.decorator';
import { GetAuthUser } from '@decorators/user.decorator';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import User from '@modules/user/entities/user.entity';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { UpdateResult } from 'typeorm';
import { AuthService } from './auth.service';
import { AuthFacebookDto } from './dto/auth-facebook.dto';
import { AuthGoogleDto } from './dto/auth-google.dto';
import { LoginDto, LoginResponse, LogoutDto } from './dto/auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login to service' })
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    return this.authService.login(loginDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Login with google' })
  @Post('google')
  googleAuth(
    @Body() authGoogleDto: AuthGoogleDto,
    @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    return this.authService.loginGoolge(authGoogleDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Login with facebook' })
  @Post('facebook')
  facebookAuth(
    @Body() authFacebookDto: AuthFacebookDto,
    @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    return this.authService.loginFacebook(authFacebookDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Refresh token to service' })
  @Post('refresh-token')
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.refresh(refreshTokenDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Register account' })
  @Post('register')
  register(
    @Body() createUserDto: CreateUserDto,
    @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    return this.authService.register(createUserDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Forgot your password' })
  @Post('forgot-password')
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @I18n() i18n: I18nContext,
  ): Promise<string> {
    return this.authService.forgotPassword(forgotPasswordDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Reset your password' })
  @Post('reset-password')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @I18n() i18n: I18nContext,
  ): Promise<boolean> {
    return this.authService.resetPassword(resetPasswordDto, i18n.lang);
  }

  @Auth()
  @ApiOperation({ summary: 'Logout to service' })
  @Post('logout')
  logout(
    @Body() logoutDto: LogoutDto,
    @GetAuthUser() user: User,
  ): Promise<UpdateResult> {
    return this.authService.logout(logoutDto, user);
  }
}
