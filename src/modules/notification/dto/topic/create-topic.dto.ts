import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTopicDto {
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', { name: 'Name' }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ default: 'HELLO' })
  name: string;

  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'description',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'description',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ default: 'This is description' })
  description: string;

  @IsNumber(
    {},
    {
      each: true,
      message: i18nValidationMessage('validation.is_array_number', {
        name: 'user_ids',
      }),
    },
  )
  @Transform(({ value }: TransformFnParams) => [...new Set(value)])
  @ApiProperty({ example: [1, 2, 3], default: [] })
  user_ids: number[];
}
