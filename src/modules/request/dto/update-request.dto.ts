import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateRequestDto {
  @ApiProperty({ example: 'Ghi chú công việc' })
  description: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'name',
    }),
  })
  @ApiProperty()
  name: string;

  @IsDateString({
    message: i18nValidationMessage('validation.is_date', {
      name: 'deadline',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'deadline',
    }),
  })
  @ApiProperty({ example: new Date() })
  deadline: string;

  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.is_number', {
        name: 'user_id',
      }),
    },
  )
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'user_id',
    }),
  })
  @ApiProperty()
  user_id: number;
}
