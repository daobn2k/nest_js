import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderBy } from '@utils/order-by';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export enum SortByUser {
  ID = 'id',
  EMAIL = 'email',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export class ListUserDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'page',
    }),
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.is_number', {
        name: 'page',
      }),
    },
  )
  @Transform(({ value }: TransformFnParams) => +value)
  @ApiProperty({
    example: 1,
    description: 'Page number',
  })
  page: number;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'page_size',
    }),
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.is_number', {
        name: 'page_size',
      }),
    },
  )
  @Transform(({ value }: TransformFnParams) => +value)
  @ApiProperty({
    example: 10,
    description: 'Items per page number',
  })
  page_size: number;

  @IsOptional()
  @IsEnum(SortByUser, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(SortByUser).join(', '),
      field: 'sort_by',
    }),
  })
  @ApiPropertyOptional({
    description: 'Sort by field name',
    enum: SortByUser,
    example: SortByUser.ID,
  })
  sort_by: SortByUser;

  @IsOptional()
  @IsEnum(OrderBy, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(OrderBy).join(', '),
      field: 'order_by',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by user',
    enum: OrderBy,
    example: OrderBy.ASC,
  })
  order_by: OrderBy;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiPropertyOptional({ description: 'Search by email' })
  email: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiPropertyOptional({ description: 'Search by phone' })
  phone: string;

  @IsOptional()
  @IsBooleanString({
    message: i18nValidationMessage('validation.is_boolean', {
      name: 'is_active',
    }),
  })
  @ApiPropertyOptional({ description: 'Search user active', type: Boolean })
  is_active: boolean;
}
