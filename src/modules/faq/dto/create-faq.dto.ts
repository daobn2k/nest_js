import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateFaqDto {
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'title',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'title',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ example: 'This is title' })
  title: string;

  @IsString({
    message: i18nValidationMessage('validation.is_string', { name: 'content' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'content',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ example: 'This is content' })
  content: string;
}
