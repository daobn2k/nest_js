import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from '@utils/list-response';
import { OrderBy } from '@utils/order-by';
import { lowerCase } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import { DeleteResult, FindOperator, Raw, Repository } from 'typeorm';
import { CreateFaqDto } from './dto/create-faq.dto';
import { ListFaqDto, SortByFaq } from './dto/list-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import FAQ from './entities/faq.entity';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(FAQ)
    private faqRepository: Repository<FAQ>,
    private readonly i18n: I18nService,
  ) {}

  async create({ title, content }: CreateFaqDto): Promise<FAQ> {
    const faq: FAQ = new FAQ();

    faq.title = title;
    faq.content = content;

    return await this.faqRepository.save(faq);
  }

  async find(query: ListFaqDto): Promise<List<FAQ>> {
    const {
      page,
      page_size,
      sort_by = SortByFaq.ID,
      order_by = OrderBy.ASC,
      title,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +page_size;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      title?: FindOperator<string>;
    } = {};

    if (title) {
      filters.title = Raw(
        (alias: string) => `LOWER(${alias}) Like '%${lowerCase(title)}%'`,
      );
    }

    const [data, total]: [FAQ[], number] =
      await this.faqRepository.findAndCount({
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

  async findOne(id: number, lang: string): Promise<FAQ> {
    const faq: FAQ = await this.faqRepository.findOne(id);

    if (!faq) {
      const message: string = await this.i18n.t('faq.not_found', {
        lang,
      });

      throw new NotFoundException(message);
    }

    return faq;
  }

  async update(
    id: number,
    { title, content }: UpdateFaqDto,
    lang: string,
  ): Promise<FAQ> {
    const faq: FAQ = await this.findOne(id, lang);

    faq.title = title;
    faq.content = content;

    return await this.faqRepository.save(faq);
  }

  async remove(id: number, lang: string): Promise<DeleteResult> {
    await this.findOne(id, lang);

    return await this.faqRepository.delete(id);
  }
}
