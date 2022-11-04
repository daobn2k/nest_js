import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AuthGoogleDto {
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'access_token',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'access_token',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty()
  access_token: string;

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
