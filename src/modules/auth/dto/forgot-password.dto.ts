import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ForgotPasswordDto {
  @IsEmail({}, { message: i18nValidationMessage('validation.email.not_valid') })
  @ApiProperty({ example: 'admin@gmail.com' })
  email: string;
}
