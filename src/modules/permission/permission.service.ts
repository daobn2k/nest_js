import { apis as defaultApis } from '@modules/api/api.constant';
import Role from '@modules/role/entities/role.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from '@utils/list-response';
import { OrderBy } from '@utils/order-by';
import { lowerCase } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import {
  DeleteResult,
  FindOperator,
  getRepository,
  Like,
  Raw,
  Repository,
} from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ListPermissionDto, SortByPermission } from './dto/list-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import Permission from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private readonly i18n: I18nService,
  ) {}

  async create(
    { name, description, role_id, apis }: CreatePermissionDto,
    lang: string,
  ): Promise<Permission> {
    const permission: Permission = await this.permissionRepository.findOne({
      name,
    });

    if (permission) {
      const message: string = await this.i18n.t('permission.existed', { lang });

      throw new ForbiddenException(message);
    }

    const nPermission: Permission = new Permission();

    nPermission.name = name;
    nPermission.description = description;

    const newApis: string[] = apis.filter((api: string) =>
      defaultApis.includes(api),
    );

    nPermission.apis = newApis;

    const role: Role = await getRepository(Role).findOne(role_id);

    if (role) {
      nPermission.role = role;
    } else {
      const message: string = await this.i18n.t('role.not_found', { lang });

      throw new NotFoundException(message);
    }

    return await this.permissionRepository.save(nPermission);
  }

  async find(query: ListPermissionDto): Promise<List<Permission>> {
    const {
      page,
      page_size,
      sort_by = SortByPermission.ID,
      order_by = OrderBy.ASC,
      name,
      role,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +page_size;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      name?: FindOperator<string>;
      role?: Record<string, FindOperator<string>>;
    } = {};

    if (name) {
      filters.name = Raw(
        (alias: string) => `LOWER(${alias}) Like '%${lowerCase(name)}%'`,
      );
    }

    if (role) {
      filters.role = { name: Like(`%${role}%`) };
    }

    const [data, total]: [Permission[], number] =
      await this.permissionRepository.findAndCount({
        where: filters,
        relations: ['role'],
        order: { [sort_by]: order_by },
        take: limit,
        skip,
      });

    return {
      data,
      page: nPage,
      page_size: limit,
      total,
      total_page: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, lang: string): Promise<Permission> {
    const permission: Permission = await this.permissionRepository.findOne(id, {
      relations: ['role'],
    });

    if (!permission) {
      const message: string = await this.i18n.t('permission.not_found', {
        lang,
      });

      throw new NotFoundException(message);
    }

    return permission;
  }

  async update(
    id: number,
    { name, description, role_id, apis }: UpdatePermissionDto,
    lang: string,
  ): Promise<Permission> {
    const permission: Permission = await this.findOne(id, lang);

    permission.name = name;
    permission.description = description;

    const newApis: string[] = apis.filter((api: string) =>
      defaultApis.includes(api),
    );

    permission.apis = newApis;

    const role: Role = await getRepository(Role).findOne(role_id);

    if (role) {
      permission.role = role;
    } else {
      const message: string = await this.i18n.t('role.not_found', { lang });

      throw new NotFoundException(message);
    }

    return await this.permissionRepository.save(permission);
  }

  async remove(id: number, lang: string): Promise<DeleteResult> {
    await this.findOne(id, lang);

    return await this.permissionRepository.delete(id);
  }
}
