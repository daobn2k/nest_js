import Permission from '@modules/permission/entities/permission.entity';
import User from '@modules/user/entities/user.entity';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { removeSpecialCharacters } from '@utils/common';
import { List } from '@utils/list-response';
import { OrderBy } from '@utils/order-by';
import { lowerCase } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import {
  DeleteResult,
  FindOperator,
  getRepository,
  In,
  Raw,
  Repository,
} from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { ListRoleDto, SortByRole } from './dto/list-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import Role from './entities/role.entity';
import { Roles } from './role.constant';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly i18n: I18nService,
  ) {}

  async onModuleInit() {
    /**
     * Init @Roles
     */
    await Promise.all(
      Object.values(Roles).map(async (name: string) => {
        const role: Role = await this.roleRepository.findOne({ name });

        if (!role) {
          const nRole: Role = new Role();

          nRole.name = name;
          nRole.deleteable = false;

          await this.roleRepository.save(nRole);
        }
      }),
    );
  }

  async can(roles: Role[], api: string): Promise<boolean> {
    const valid: boolean[] = (
      await Promise.all(
        roles.map(async (r: Role) => {
          if (r.name === Roles.ADMIN) return true;

          if (!r.is_active) return false;

          const role: Role = await this.roleRepository.findOne(r.id, {
            relations: ['permissions'],
          });

          return role.permissions.map((p: Permission) => p.apis.includes(api));
        }),
      )
    ).flat();

    return valid.some((v: boolean) => v);
  }

  async create(
    {
      name: nName,
      description,
      is_active,
      user_ids,
      permission_ids,
    }: CreateRoleDto,
    lang: string,
  ): Promise<Role> {
    const name: string = removeSpecialCharacters(nName, 'upper');

    if (!name) {
      const message: string = await this.i18n.t('role.name_invalid', { lang });

      throw new BadRequestException(message);
    }

    const role: Role = await this.roleRepository.findOne({ name });

    if (role) {
      const message: string = await this.i18n.t('role.existed', { lang });

      throw new ForbiddenException(message);
    }

    const nRole: Role = new Role();

    nRole.name = name;
    nRole.description = description;
    nRole.is_active = is_active;

    const permissions: Permission[] = await getRepository(Permission).find({
      id: In(permission_ids),
    });

    nRole.permissions = permissions.filter((p: Permission) => !!p);

    const users: User[] = await getRepository(User).find({
      id: In(user_ids),
    });

    nRole.users = users.filter((user: User) => !!user);

    return await this.roleRepository.save(nRole);
  }

  async find(query: ListRoleDto): Promise<List<Role>> {
    const {
      page,
      page_size,
      sort_by = SortByRole.ID,
      order_by = OrderBy.ASC,
      name,
      is_active,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +page_size;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      name?: FindOperator<string>;
      is_active?: boolean;
    } = {};

    if (name) {
      filters.name = Raw(
        (alias: string) => `LOWER(${alias}) Like '%${lowerCase(name)}%'`,
      );
    }

    if (is_active) {
      filters.is_active = is_active;
    }

    const [data, total]: [Role[], number] =
      await this.roleRepository.findAndCount({
        where: filters,
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

  async findOne(id: number, lang: string): Promise<Role> {
    const role: Role = await this.roleRepository.findOne(id, {
      relations: ['users', 'permissions'],
    });

    if (!role) {
      const message: string = await this.i18n.t('role.not_found', { lang });

      throw new NotFoundException(message);
    }

    return role;
  }

  async update(
    id: number,
    {
      name: nName,
      description,
      is_active,
      user_ids,
      permission_ids,
    }: UpdateRoleDto,
    lang: string,
  ): Promise<Role> {
    const name: string = removeSpecialCharacters(nName, 'upper');

    if (!name) {
      const message: string = await this.i18n.t('role.name_invalid', { lang });

      throw new BadRequestException(message);
    }

    const defaultRoles: string[] = Object.values(Roles);
    const isNameForbid: boolean = defaultRoles.includes(name);

    const role: Role = await this.findOne(id, lang);
    const isRoleDefault: boolean = defaultRoles.includes(role.name);

    role.description = description;
    role.is_active = Roles.ADMIN === role.name ? true : is_active; // can not deactive with role ADMIN

    if (isRoleDefault && role.name !== name) {
      const message: string = await this.i18n.t('role.change_name_default', {
        lang,
      });

      throw new NotAcceptableException(message);
    }

    if (!isNameForbid && role.deleteable) {
      role.name = name;
    }

    if (isNameForbid && !isRoleDefault) {
      const message: string = await this.i18n.t('role.unique', {
        lang,
        args: { roleName: name },
      });

      throw new NotAcceptableException(message);
    }

    if (role.name !== Roles.ADMIN) {
      const permissions: Permission[] = await getRepository(Permission).find({
        id: In(permission_ids),
      });

      role.permissions = permissions.filter((p: Permission) => !!p);
    }

    const users: User[] = await getRepository(User).find({
      id: In(user_ids),
    });

    role.users = users.filter((user: User) => !!user);

    return await this.roleRepository.save(role);
  }

  async remove(id: number, lang: string): Promise<DeleteResult> {
    const role: Role = await this.findOne(id, lang);

    if (!role.deleteable) {
      const message: string = await this.i18n.t('role.deleteable', {
        lang,
        args: { roleName: role.name },
      });

      throw new ForbiddenException(message);
    }

    return await this.roleRepository.delete(id);
  }
}
