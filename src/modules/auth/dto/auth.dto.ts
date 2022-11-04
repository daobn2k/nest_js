import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export interface LoginResponse {
  token: string;
  refresh_token: string;
  expired_time: number;
}
export class LogoutDto {
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'fcm_token',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiPropertyOptional({ example: '' })
  fcm_token: string;
}

export class LoginDto extends LogoutDto {
  @IsEmail({}, { message: i18nValidationMessage('validation.email.not_valid') })
  @ApiProperty({ example: 'admin@gmail.com' })
  email: string;

  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'password',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'password',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ example: '123' })
  password: string;
}
