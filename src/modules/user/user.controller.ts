import { Auth } from '@decorators/roles.decorator';
import { GetAuthUser } from '@decorators/user.decorator';
import { UserApis } from '@modules/api/api.constant';
import File from '@modules/file/entities/file.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { imageFileFilter } from '@utils/file-uploading';
import { List } from '@utils/list-response';
import { I18n, I18nContext } from 'nestjs-i18n';
import { DeleteResult } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import User from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(UserApis.ADD_USER)
  @ApiOperation({
    summary: 'Create an user, role ADMIN or role have permission ADD_USER',
  })
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @I18n() i18n: I18nContext,
  ): Promise<User> {
    return this.userService.create(createUserDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Find all users' })
  @Get()
  find(@Query() query: ListUserDto): Promise<List<User>> {
    return this.userService.find(query);
  }

  @Auth()
  @ApiOperation({ summary: 'Get my profile' })
  @Get('profile')
  profile(@GetAuthUser() user: User, @I18n() i18n: I18nContext): Promise<User> {
    return this.userService.findOne(user.id, i18n.lang);
  }

  @ApiOperation({ summary: 'Find one user' })
  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<User> {
    return this.userService.findOne(+id, i18n.lang);
  }

  @Auth()
  @ApiOperation({ summary: 'Upload avatar profile, form data key: avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter: imageFileFilter,
    }),
  )
  uploadFiles(
    @UploadedFile() file: Express.Multer.File,
    @GetAuthUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<File> {
    return this.userService.uploadAvatar(user.id, file, i18n.lang);
  }

  @Auth()
  @ApiOperation({
    summary: 'Update my profile',
  })
  @Put('profile')
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetAuthUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<User> {
    return this.userService.updateProfile(user.id, updateProfileDto, i18n.lang);
  }

  @Auth(UserApis.EDIT_USER)
  @ApiOperation({
    summary: 'Update an user, role ADMIN or role have permission EDIT_USER',
  })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @I18n() i18n: I18nContext,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto, i18n.lang);
  }

  @Auth(UserApis.DELETE_USER)
  @ApiOperation({
    summary: 'Delete an user, role ADMIN or role have permission DELETE_USER',
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetAuthUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.userService.remove(+id, user, i18n.lang);
  }

  @Auth()
  @ApiOperation({ summary: 'Change password of user' })
  @Post('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @I18n() i18n: I18nContext,
    @GetAuthUser() user: User,
  ): Promise<boolean> {
    return this.userService.changePassword(
      user.id,
      changePasswordDto,
      i18n.lang,
    );
  }
}
