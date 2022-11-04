import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateProfileDto {
  @IsPhoneNumber('VN', {
    message: i18nValidationMessage('validation.phone.not_valid'),
  })
  @ApiProperty({ example: '84909123456' })
  phone: string;

  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'first_name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'first_name',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ example: 'John' })
  first_name: string;

  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'last_name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'last_name',
    }),
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiProperty({ example: 'Peter' })
  last_name: string;

  // @IsNotEmpty({
  //   message: i18nValidationMessage('validation.is_required', {
  //     name: 'location',
  //   }),
  // })
  // @IsObject({
  //   message: i18nValidationMessage('validation.is_object', {
  //     name: 'location',
  //   }),
  // })
  // @ValidateNested()
  // @Type(() => LocationDto)
  // @ApiProperty()
  // location: LocationDto;
}
