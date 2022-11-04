import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class DeleteMultiNotificationDto {
  @IsNumber(
    {},
    {
      each: true,
      message: i18nValidationMessage('validation.is_array_number', {
        name: 'ids',
      }),
    },
  )
  @Transform(({ value }: TransformFnParams) => [...new Set(value)])
  @ApiProperty({ example: [1, 2, 3], default: [] })
  ids: number[];
}
