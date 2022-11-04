import User from '@modules/user/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from '@utils/list-response';
import { OrderBy } from '@utils/order-by';
import { S3 } from 'aws-sdk';
import { lowerCase } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import { DeleteResult, FindOperator, Raw, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { FileDto, FileManualDto } from './dto/file.dto';
import { ListFileDto, SortByFile } from './dto/list-file.dto';
import File from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private readonly i18n: I18nService,
    private readonly config: ConfigService,
  ) {}

  async create(files: FileDto[], user: User, lang: string): Promise<File[]> {
    if (!files || files.length === 0) {
      const message: string = await this.i18n.t('file.not_found', {
        lang,
      });

      throw new NotFoundException(message);
    }

    const newFiles: FileDto[] = files.filter((file: FileDto) => file.size > 0);

    const s3: S3 = new S3();

    const allFiles: File[] = await Promise.all(
      newFiles.map(async (file: FileDto) => {
        const key = `${uuid()}-${file.originalname}`;

        const nFile: File = new File();

        nFile.originalname = file.originalname;
        nFile.mimetype = file.mimetype;
        nFile.size = file.size;
        nFile.uploaded_by = user;
        nFile.key = key;

        const result: S3.ManagedUpload.SendData = await s3
          .upload({
            Bucket: this.config.get<string>('AWS_PUBLIC_BUCKET_NAME'),
            Body: file.buffer,
            Key: key,
            ACL: 'public-read',
            ContentType: 'image/png',
          })
          .promise();

        nFile.url = result.Location;

        return nFile;
      }),
    );

    return await this.fileRepository.save(allFiles);
  }

  async createManual({ url }: FileManualDto, user: User): Promise<File> {
    const key: string = uuid();

    const nFile: File = new File();

    nFile.originalname = url;
    nFile.mimetype = 'image/png';
    nFile.size = 6969;
    nFile.uploaded_by = user;
    nFile.key = key;
    nFile.url = url;

    return await this.fileRepository.save(nFile);
  }

  async find(query: ListFileDto): Promise<List<File>> {
    const {
      page,
      page_size,
      sort_by = SortByFile.ID,
      order_by = OrderBy.ASC,
      name,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +page_size;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      originalname?: FindOperator<string>;
    } = {};

    if (name) {
      filters.originalname = Raw(
        (alias: string) => `LOWER(${alias}) Like '%${lowerCase(name)}%'`,
      );
    }

    const [data, total]: [File[], number] =
      await this.fileRepository.findAndCount({
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

  async findOne(id: number, lang: string): Promise<File> {
    const file: File = await this.fileRepository.findOne(id, {
      relations: ['uploaded_by'],
    });

    if (!file) {
      const message: string = await this.i18n.t('file.not_found', {
        lang,
      });

      throw new NotFoundException(message);
    }

    return file;
  }

  async remove(id: number, lang: string): Promise<DeleteResult> {
    const file: File = await this.findOne(id, lang);

    const s3: S3 = new S3();

    await s3
      .deleteObject({
        Bucket: this.config.get<string>('AWS_PUBLIC_BUCKET_NAME'),
        Key: file.key,
      })
      .promise();

    return await this.fileRepository.delete(id);
  }
}
