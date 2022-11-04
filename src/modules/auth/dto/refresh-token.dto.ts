import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RefreshTokenDto {
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'refresh_token',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'refresh_token',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty()
  refresh_token: string;
}
