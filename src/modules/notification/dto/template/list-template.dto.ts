import { TemplateTypes } from '@modules/notification/entities/notificationTemplate.entitiy';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderBy } from '@utils/order-by';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export enum SortByTemplate {
  ID = 'id',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export class ListTemplateDto {
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
  @IsEnum(SortByTemplate, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(SortByTemplate).join(', '),
      field: 'sort_by',
    }),
  })
  @ApiPropertyOptional({
    description: 'Sort by field name',
    enum: SortByTemplate,
    example: SortByTemplate.ID,
  })
  sort_by: SortByTemplate;

  @IsOptional()
  @IsEnum(OrderBy, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(OrderBy).join(', '),
      field: 'order_by',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by template',
    enum: OrderBy,
    example: OrderBy.ASC,
  })
  order_by: OrderBy;

  @IsOptional()
  @IsEnum(TemplateTypes, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(TemplateTypes).join(', '),
      field: 'type',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by type',
    enum: TemplateTypes,
  })
  type: TemplateTypes;
}
