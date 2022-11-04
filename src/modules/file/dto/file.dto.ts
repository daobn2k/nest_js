import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty()
  originalname: string;

  @ApiProperty()
  buffer: Buffer;

  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  size: number;
}

export class FileManualDto {
  @ApiProperty()
  url: string;
}
