import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'token',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'token',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty()
  token: string;

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
