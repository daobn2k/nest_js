import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderBy } from '@utils/order-by';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export enum SortByPermission {
  ID = 'id',
  NAME = 'name',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export class ListPermissionDto {
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
  @IsEnum(SortByPermission, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(SortByPermission).join(', '),
      field: 'sort_by',
    }),
  })
  @ApiPropertyOptional({
    description: 'Sort by field name',
    enum: SortByPermission,
    example: SortByPermission.ID,
  })
  sort_by: SortByPermission;

  @IsOptional()
  @IsEnum(OrderBy, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(OrderBy).join(', '),
      field: 'order_by',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by permission',
    enum: OrderBy,
    example: OrderBy.ASC,
  })
  order_by: OrderBy;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiPropertyOptional({ description: 'Search by name' })
  name: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiPropertyOptional({ description: 'Search by role' })
  role: string;
}
