import { TemplateTypes } from '@modules/notification/entities/notificationTemplate.entitiy';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTemplateDto {
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

  @IsEnum(TemplateTypes, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(TemplateTypes).join(', '),
      field: 'type',
    }),
  })
  @ApiProperty({
    example: TemplateTypes.TOPIC,
    enum: TemplateTypes,
  })
  type: TemplateTypes;

  @ValidateIf((_) => _?.type === TemplateTypes.USER)
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
  @ApiPropertyOptional({ example: [1, 2, 3], default: [] })
  user_ids: number[];

  @ValidateIf((_) => _?.type === TemplateTypes.TOPIC)
  @IsNumber(
    {},
    {
      each: true,
      message: i18nValidationMessage('validation.is_array_number', {
        name: 'topic_ids',
      }),
    },
  )
  @Transform(({ value }: TransformFnParams) => [...new Set(value)])
  @ApiPropertyOptional({ example: [1, 2, 3], default: [] })
  topic_ids: number[];
}
