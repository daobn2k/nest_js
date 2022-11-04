import { Auth } from '@decorators/roles.decorator';
import { GetAuthUser } from '@decorators/user.decorator';
import { FileApis } from '@modules/api/api.constant';
import User from '@modules/user/entities/user.entity';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { imageFileFilter } from '@utils/file-uploading';
import { List } from '@utils/list-response';
import { I18n, I18nContext } from 'nestjs-i18n';
import { DeleteResult } from 'typeorm';
import { ListFileDto } from './dto/list-file.dto';
import File from './entities/file.entity';
import { FileService } from './file.service';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Auth()
  @ApiOperation({ summary: 'Upload files, max 10 file. Form data key: files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: imageFileFilter,
    }),
  )
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @GetAuthUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<File[]> {
    return this.fileService.create(files, user, i18n.lang);
  }

  @Auth(FileApis.VIEW_FILE)
  @ApiOperation({
    summary: 'Find all files, role ADMIN or role have permission VIEW_FILE',
  })
  @Get()
  find(@Query() query: ListFileDto): Promise<List<File>> {
    return this.fileService.find(query);
  }

  @Auth(FileApis.VIEW_FILE)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a file, role ADMIN or role have permission VIEW_FILE',
  })
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<File> {
    return this.fileService.findOne(+id, i18n.lang);
  }

  @Auth(FileApis.DELETE_FILE)
  @ApiOperation({
    summary: 'Delete a file, role ADMIN or role have permission DELETE_FILE',
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.fileService.remove(+id, i18n.lang);
  }
}
