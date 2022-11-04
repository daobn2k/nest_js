import { Auth } from '@decorators/roles.decorator';
import { PermissionApis } from '@modules/api/api.constant';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { List } from '@utils/list-response';
import { I18n, I18nContext } from 'nestjs-i18n';
import { DeleteResult } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ListPermissionDto } from './dto/list-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import Permission from './entities/permission.entity';
import { PermissionService } from './permission.service';

@ApiTags('permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Auth(PermissionApis.ADD_PERMISSION)
  @ApiOperation({
    summary:
      'Create a permission, role ADMIN or role have permission ADD_PERMISSION',
  })
  @Post()
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @I18n() i18n: I18nContext,
  ): Promise<Permission> {
    return this.permissionService.create(createPermissionDto, i18n.lang);
  }

  @Auth(PermissionApis.VIEW_PERMISSION)
  @ApiOperation({
    summary:
      'Find all permissions, role ADMIN or role have permission VIEW_PERMISSION',
  })
  @Get()
  find(@Query() query: ListPermissionDto): Promise<List<Permission>> {
    return this.permissionService.find(query);
  }

  @Auth(PermissionApis.VIEW_PERMISSION)
  @ApiOperation({
    summary:
      'Find a permission, role ADMIN or role have permission VIEW_PERMISSION',
  })
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<Permission> {
    return this.permissionService.findOne(+id, i18n.lang);
  }

  @Auth(PermissionApis.EDIT_PERMISSION)
  @ApiOperation({
    summary:
      'Update a permission, role ADMIN or role have permission EDIT_PERMISSION',
  })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @I18n() i18n: I18nContext,
  ): Promise<Permission> {
    return this.permissionService.update(+id, updatePermissionDto, i18n.lang);
  }

  @Auth(PermissionApis.DELETE_PERMISSION)
  @ApiOperation({
    summary:
      'Delete a permission, role ADMIN or role have permission DELETE_PERMISSION',
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.permissionService.remove(+id, i18n.lang);
  }
}
