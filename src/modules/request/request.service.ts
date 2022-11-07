import { ListUserDto } from '@modules/user/dto/list-user.dto';
import User from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';
import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from '@utils/list-response';
import { OrderBy } from '@utils/order-by';
import { I18nService } from 'nestjs-i18n';
import {
  Brackets,
  getRepository,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestDto, SortByRequest } from './dto/list-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import Request from './entities/request.entity';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    private readonly i18n: I18nService,
  ) {}

  // create Qurery
  // .createQueryBuilder('user')
  // .where('user.id = :id', { id: user_id })
  // .leftJoinAndSelect('user.department', 'department')
  // .select(['user.id', 'de.id', 'de.name'])
  // .getOne();

  async checkExsitUser(user_id, lang) {
    const checkIdExist: User = await getRepository(User).findOne({
      where: { id: user_id },
      select: ['id'],
    });

    if (!checkIdExist) {
      const message: string = await this.i18n.t('user.not_found', { lang });
      throw new NotFoundException(message);
    }
    return true;
  }
  async create(createRequestDto: CreateRequestDto, lang) {
    const { name, deadline, description, user_id } = createRequestDto;

    const isEx = await this.checkExsitUser(user_id, lang);

    if (!isEx) return;

    const work: Request = new Request();

    work.name = name;
    work.description = description;
    work.deadline = new Date(deadline);
    work.user = { id: user_id } as User;

    return this.requestRepository.save(work);
  }

  async findAll(): Promise<Request[]> {
    return await this.requestRepository.find();
  }

  async find(query: ListRequestDto): Promise<List<Request>> {
    const {
      page,
      page_size,
      sort_by = SortByRequest.ID,
      order_by = OrderBy.ASC,
      name,
      user_id,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +page_size;
    const skip: number = (nPage - 1) * limit;

    const queryBuilder: SelectQueryBuilder<Request> = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user');

    if (name) {
      // call back search with keyword
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.orWhere('request.name Like :keyword', { keyword: name });
        }),
      );
    }
    if (user_id) {
      queryBuilder.andWhere('user.id = :user_id', { user_id });
    }

    const [data, total]: [Request[], number] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      data,
      total,
      page: nPage,
      page_size,
      total_page: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, lang) {
    const request: Request = await this.requestRepository
      .createQueryBuilder('request')
      .andWhere('request.id = :id', { id: +id })
      .leftJoinAndSelect('request.user', 'user')
      .select(['request', 'user.id', 'user.email'])
      .getOne();
    if (!request) {
      const message: string = await this.i18n.t('request.not_found', { lang });

      throw new NotFoundException(message);
    }
    return request;
  }

  async update(id: number, updateRequestDto: UpdateRequestDto, lang) {
    const { name, description, user_id, deadline } = updateRequestDto;

    const request: Request = await this.requestRepository.findOne({ id: +id });
    if (!request) {
      const message: string = await this.i18n.t('request.not_found', { lang });

      throw new NotFoundException(message);
    }

    const isExUser = this.checkExsitUser(user_id, lang);

    if (!isExUser) return;

    const data = new Request();
    data.name = name;
    data.description = description;
    data.deadline = new Date(deadline);
    data.user = { id: user_id } as User;

    await this.requestRepository.update({ id: +id }, data);
    return await this.requestRepository.findOne({ id: +id });
  }

  async remove(id: number, lang) {
    const request: Request = await this.requestRepository.findOne({ id: +id });
    if (!request) {
      const message: string = await this.i18n.t('request.not_found', { lang });

      throw new NotFoundException(message);
    }

    const result = await this.requestRepository.delete({ id: +id });

    if (result.affected !== 1) {
      const message: string = await this.i18n.t('request.can_not_sefl', {
        lang,
      });

      throw new NotAcceptableException(message);
    }
    return 'Success';
  }
}
