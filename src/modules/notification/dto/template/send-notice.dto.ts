import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SendNotificationDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', { name: 'id' }),
  })
  @IsNumber(
    {},
    { message: i18nValidationMessage('validation.is_number', { name: 'id' }) },
  )
  @ApiProperty()
  id: number;
}
