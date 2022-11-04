import { FileDto } from '@modules/file/dto/file.dto';
import File from '@modules/file/entities/file.entity';
import { FileService } from '@modules/file/file.service';
import Role from '@modules/role/entities/role.entity';
import { Roles } from '@modules/role/role.constant';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from '@utils/list-response';
import { OrderBy } from '@utils/order-by';
import * as crypto from 'crypto';
import { I18nService } from 'nestjs-i18n';
import {
  DeleteResult,
  FindOperator,
  getRepository,
  In,
  Like,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserByFacebookDto } from './dto/create-user-facebook.dto';
import { CreateUserByGoogleDto } from './dto/create-user-google.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUserDto, SortByUser } from './dto/list-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import User from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly i18n: I18nService,
    private readonly fileService: FileService,
  ) {}

  hashPassword(password: string): string {
    return crypto.createHmac('sha256', password).digest('hex');
  }

  async create(
    { email, password, first_name, last_name }: CreateUserDto,
    lang: string,
  ): Promise<User> {
    const findUserByEmail: User = await this.userRepository.findOne({ email });

    if (findUserByEmail) {
      const message: string = await this.i18n.t('user.email.existed', { lang });

      throw new ForbiddenException(message);
    }

    const user: User = new User();

    user.email = email;
    user.first_name = first_name;
    user.last_name = last_name;
    user.password = this.hashPassword(password);

    const role: Role = await getRepository(Role).findOne({ name: Roles.USER });

    user.roles = [role];

    return await this.userRepository.save(user);
  }

  async createByGoogle({
    email,
    first_name,
    last_name,
    google_id,
  }: CreateUserByGoogleDto): Promise<User> {
    const user: User = new User();

    user.email = email;
    user.first_name = first_name;
    user.last_name = last_name;
    user.google_id = google_id;

    const role: Role = await getRepository(Role).findOne({ name: Roles.USER });

    user.roles = [role];

    return await this.userRepository.save(user);
  }

  async createByFacebook({
    email,
    first_name,
    last_name,
    facebook_id,
  }: CreateUserByFacebookDto): Promise<User> {
    const user: User = new User();

    user.email = email;
    user.first_name = first_name;
    user.last_name = last_name;
    user.facebook_id = facebook_id;

    const role: Role = await getRepository(Role).findOne({ name: Roles.USER });

    user.roles = [role];

    return await this.userRepository.save(user);
  }

  async comparePassword(id: number, password: string): Promise<boolean> {
    const user: User = await getRepository(User)
      .createQueryBuilder()
      .addSelect('password')
      .where({
        id,
        password: this.hashPassword(password),
      })
      .getOne();

    return !!user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async find(query: ListUserDto): Promise<List<User>> {
    const {
      page,
      page_size,
      sort_by = SortByUser.ID,
      order_by = OrderBy.ASC,
      email,
      phone,
      is_active,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +page_size;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      email?: FindOperator<string>;
      phone?: FindOperator<string>;
      is_active?: boolean;
    } = {};

    if (email) {
      filters.email = Like(`%${email}%`);
    }

    if (phone) {
      filters.phone = Like(`%${phone}%`);
    }

    if (is_active) {
      filters.is_active = is_active;
    }

    const [data, total]: [User[], number] =
      await this.userRepository.findAndCount({
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

  async findOneByStrategy(id: number): Promise<User> {
    const user: User = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .select([
        'user.id',
        'user.username',
        'roles.id',
        'roles.name',
        'roles.is_active',
        'avatar.url',
      ])
      .getOne();

    return user;
  }

  async findOne(id: number, lang: string): Promise<User> {
    const user: User = await this.userRepository.findOne(id, {
      relations: ['roles'],
    });

    if (!user) {
      const message: string = await this.i18n.t('user.not_found', { lang });

      throw new NotFoundException(message);
    }

    return user;
  }

  async findByEmail(email: string, lang: string): Promise<User> {
    const user: User = await this.userRepository.findOne(
      { email },
      {
        relations: ['roles'],
      },
    );

    if (!user) {
      const message: string = await this.i18n.t('user.not_found', { lang });

      throw new NotFoundException(message);
    }

    return user;
  }

  async findByCondition(
    condition: Record<string, string | number>,
  ): Promise<User> {
    return await this.userRepository.findOne(condition);
  }

  async update(
    id: number,
    { phone, first_name, last_name, role_ids }: UpdateUserDto,
    lang: string,
  ): Promise<User> {
    const user: User = await this.findOne(id, lang);

    user.first_name = first_name;
    user.last_name = last_name;
    user.phone = phone;

    const roles: Role[] = await getRepository(Role).find({
      id: In(role_ids),
    });

    user.roles = roles.filter((role: Role) => !!role);

    await this.userRepository.save(user);

    return await this.userRepository.findOne(id);
  }

  async updateProfile(
    id: number,
    { phone, first_name, last_name }: UpdateProfileDto,
    lang: string,
  ): Promise<User> {
    const user: User = await this.findOne(id, lang);

    user.first_name = first_name;
    user.last_name = last_name;
    user.phone = phone;

    await this.userRepository.save(user);

    return await this.userRepository.findOne(id);
  }

  async uploadAvatar(
    id: number,
    fileDto: FileDto,
    lang: string,
  ): Promise<File> {
    const user: User = await this.findOne(id, lang);

    const oldAvatar: File = user.avatar;

    const filesDto: FileDto[] = [fileDto].filter((file: FileDto) => !!file);

    const files: File[] = await this.fileService.create(filesDto, user, lang);

    user.avatar = files[0];

    await this.userRepository.save(user);

    if (oldAvatar) {
      await this.fileService.remove(oldAvatar.id, lang);
    }

    return files[0];
  }

  async findByRefreshToken(
    id: number,
    refreshToken: string,
    lang: string,
  ): Promise<User> {
    const user: User = await getRepository(User)
      .createQueryBuilder()
      .where({
        id,
        refresh_token: refreshToken,
      })
      .getOne();

    if (!user) {
      const message: string = await this.i18n.t('user.not_found', { lang });

      throw new NotFoundException(message);
    }

    return user;
  }

  async updateRefreshToken(
    id: number,
    refreshToken: string,
    extra?: { google_id?: string; facebook_id?: string },
  ): Promise<UpdateResult> {
    const modified: {
      refresh_token: string;
      google_id?: string;
      facebook_id?: string;
    } = {
      refresh_token: refreshToken,
    };

    if (extra?.google_id) {
      modified.google_id = extra.google_id;
    }

    if (extra?.facebook_id) {
      modified.facebook_id = extra.facebook_id;
    }

    return await this.userRepository.update({ id }, modified);
  }

  async changePassword(
    id: number,
    { new_password, old_password }: ChangePasswordDto,
    lang: string,
  ): Promise<boolean> {
    const isValid: boolean = await this.comparePassword(id, old_password);

    if (!isValid) {
      const message: string = await this.i18n.t('user.old_password_invalid', {
        lang,
      });

      throw new BadRequestException(message);
    }

    const password: string = this.hashPassword(old_password);
    const newPasswordHash: string = this.hashPassword(new_password);

    if (password === newPasswordHash) {
      const message: string = await this.i18n.t('user.password_not_same', {
        lang,
      });

      throw new NotAcceptableException(message);
    }

    const update: UpdateResult = await this.userRepository.update(
      { id },
      { password: newPasswordHash },
    );

    if (update.affected === 1) {
      return true;
    }

    return false;
  }

  async resetPassword(
    id: number,
    password: string,
    lang: string,
  ): Promise<boolean> {
    const user: User = await this.findOne(id, lang);

    user.password = this.hashPassword(password);

    await this.userRepository.save(user);

    return true;
  }

  async remove(id: number, user: User, lang: string): Promise<DeleteResult> {
    if (user.id === id) {
      const message: string = await this.i18n.t('user.can_not_sefl', {
        lang,
      });

      throw new NotAcceptableException(message);
    }

    await this.findOne(id, lang);

    return await this.userRepository.delete(id);
  }
}
