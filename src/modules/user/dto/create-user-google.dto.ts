import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserByGoogleDto {
  @IsEmail({}, { message: i18nValidationMessage('validation.email.not_valid') })
  @ApiProperty({ example: 'example@gmail.com' })
  email: string;

  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'first_name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'first_name',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ example: 'Peter' })
  first_name: string;

  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'last_name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'last_name',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ example: 'John' })
  last_name: string;

  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'google_id',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'google_id',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ example: '123456789' })
  google_id: string;
}
