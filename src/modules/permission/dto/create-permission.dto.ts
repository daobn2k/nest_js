import { apis, UserApis } from '@modules/api/api.constant';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreatePermissionDto {
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', { name: 'Name' }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ default: 'SALE' })
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
      message: i18nValidationMessage('validation.is_number', {
        name: 'role_id',
      }),
    },
  )
  @ApiProperty({ example: 1, default: 1 })
  role_id: number;

  @IsString({
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(apis).join(', '),
      field: 'apis',
    }),
    each: true,
  })
  @Transform(({ value }: TransformFnParams) => [...new Set(value)])
  @ApiProperty({ default: [UserApis.VIEW_USER] })
  apis: string[];
}
