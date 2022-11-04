import { Auth } from '@decorators/roles.decorator';
import { RoleApis } from '@modules/api/api.constant';
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
import { CreateRoleDto } from './dto/create-role.dto';
import { ListRoleDto } from './dto/list-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import Role from './entities/role.entity';
import { RoleService } from './role.service';

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Auth(RoleApis.ADD_ROLE)
  @ApiOperation({
    summary: 'Create a role, role ADMIN or role have permission ADD_ROLE',
  })
  @Post()
  create(
    @Body() createRoleDto: CreateRoleDto,
    @I18n() i18n: I18nContext,
  ): Promise<Role> {
    return this.roleService.create(createRoleDto, i18n.lang);
  }

  @Auth(RoleApis.VIEW_ROLE)
  @ApiOperation({
    summary: 'Find all role, role ADMIN or role have permission VIEW_ROLE',
  })
  @Get()
  find(@Query() query: ListRoleDto): Promise<List<Role>> {
    return this.roleService.find(query);
  }

  @Auth(RoleApis.VIEW_ROLE)
  @ApiOperation({
    summary: 'Find a role, role ADMIN or role have permission VIEW_ROLE',
  })
  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<Role> {
    return this.roleService.findOne(+id, i18n.lang);
  }

  @Auth(RoleApis.EDIT_ROLE)
  @ApiOperation({
    summary: 'Update a role, role ADMIN or role have permission EDIT_ROLE',
  })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @I18n() i18n: I18nContext,
  ): Promise<Role> {
    return this.roleService.update(+id, updateRoleDto, i18n.lang);
  }

  @Auth(RoleApis.DELETE_ROLE)
  @ApiOperation({
    summary: 'Delete a role, role ADMIN or role have permission DELETE_ROLE',
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.roleService.remove(+id, i18n.lang);
  }
}
