import { DeviceService } from '@modules/device/device.service';
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
import * as admin from 'firebase-admin';
import {
  BatchResponse,
  MessagingTopicManagementResponse,
  MessagingTopicResponse,
} from 'firebase-admin/lib/messaging/messaging-api';
import { difference, lowerCase, uniqBy } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import {
  DeleteResult,
  FindOperator,
  getRepository,
  In,
  Raw,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateNotificationDto } from './dto/notification/create-notification.dto';
import { DeleteMultiNotificationDto } from './dto/notification/delete-multi-notification.dto';
import {
  ListNotificationDto,
  SortByNotification,
} from './dto/notification/list-notification.dto';
import { ReadNotificationDto } from './dto/notification/read-notification.dto';
import { CreateTemplateDto } from './dto/template/create-template.dto';
import {
  ListTemplateDto,
  SortByTemplate,
} from './dto/template/list-template.dto';
import { UpdateTemplateDto } from './dto/template/update-template.dto';
import { CreateTopicDto } from './dto/topic/create-topic.dto';
import { ListTopicDto, SortByTopic } from './dto/topic/list-topic.dto';
import { UpdateTopicDto } from './dto/topic/update-topic.dto';
import Notification from './entities/notification.entity';
import Template, {
  TemplateTypes,
} from './entities/notificationTemplate.entitiy';
import Topic from './entities/notificationTopic.entity';
import { Topics } from './notification.constant';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    private readonly i18n: I18nService,
    private readonly deviceService: DeviceService,
  ) {}

  async onModuleInit() {
    /**
     * Init @Topic
     */
    await Promise.all(
      Object.values(Topics).map(async (name: string) => {
        const topic: Topic = await this.topicRepository.findOne({ name });

        if (!topic) {
          const nTopic: Topic = new Topic();

          nTopic.name = name;
          nTopic.deleteable = false;

          await this.topicRepository.save(nTopic);
        }
      }),
    );
  }

  /**
   * Notification templates, admin manage
   */

  async createTemplate({
    title,
    content,
    type,
    topic_ids = [],
    user_ids = [],
  }: CreateTemplateDto): Promise<Template> {
    const nTemplate: Template = new Template();

    nTemplate.title = title;
    nTemplate.content = content;
    nTemplate.type = type;

    if (type === TemplateTypes.TOPIC) {
      const topics: Topic[] = await this.topicRepository.find({
        id: In(topic_ids),
      });

      nTemplate.topics = topics;
    }

    if (type === TemplateTypes.USER) {
      const users: User[] = await getRepository(User).find({
        id: In(user_ids),
      });

      nTemplate.users = users;
    }

    return await this.templateRepository.save(nTemplate);
  }

  async findTemplate(query: ListTemplateDto): Promise<List<Template>> {
    const {
      page,
      page_size,
      sort_by = SortByTemplate.ID,
      order_by = OrderBy.ASC,
      type,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +page_size;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      type?: TemplateTypes;
    } = {};

    if (type) {
      filters.type = type;
    }

    const [data, total]: [Template[], number] =
      await this.templateRepository.findAndCount({
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

  async findOneTemplate(id: number, lang: string): Promise<Template> {
    const template: Template = await this.templateRepository.findOne(id, {
      relations: ['users', 'topics'],
    });

    if (!template) {
      const message: string = await this.i18n.t(
        'notification.template.not_found',
        {
          lang,
        },
      );

      throw new NotFoundException(message);
    }

    return template;
  }

  async updateTemplate(
    id: number,
    { title, content, type, user_ids, topic_ids }: UpdateTemplateDto,
    lang: string,
  ): Promise<Template> {
    const template: Template = await this.findOneTemplate(id, lang);

    template.title = title;
    template.content = content;
    template.type = type;

    if (type === TemplateTypes.TOPIC) {
      const topics: Topic[] = await this.topicRepository.find({
        id: In(topic_ids),
      });

      template.topics = topics;
    }

    if (type === TemplateTypes.USER) {
      const users: User[] = await getRepository(User).find({
        id: In(user_ids),
      });

      template.users = users;
    }

    return await this.templateRepository.save(template);
  }

  async removeTemplate(id: number, lang: string): Promise<DeleteResult> {
    await this.findOneTemplate(id, lang);

    return await this.templateRepository.delete(id);
  }

  async sendNoticeTest() {
    const response: BatchResponse = await admin.messaging().sendMulticast({
      notification: { title: 'Hello', body: 'This is a new notification' },
      tokens: [
        'fyoemmxiLl5JEil_qdlPD1:APA91bFpe8TKo5rd5UTZ7vpp_dT1zjZZdQtAPSeVlbmDP1Lv262Ue81KgMrTiKr-gxeE3AI8YfN03y_H2N9cRXDEgko7PNCybIflgCRk-gWMF-IvVizKOi0StVzeqooEjMLiB97tKUl7',
      ],
    });

    return response;
  }

  async sendNotice(
    templateId: number,
    lang: string,
  ): Promise<BatchResponse | MessagingTopicResponse[]> {
    const template: Template = await this.findOneTemplate(templateId, lang);

    let response: BatchResponse | MessagingTopicResponse[];
    let notices: Notification[] = [];
    let users: User[] = [];

    switch (template.type) {
      case TemplateTypes.USER:
        const registrationTokens: string[] = (
          await Promise.all(
            template.users.map(
              async (user: User) =>
                await this.deviceService.findFcmByUser(user.id),
            ),
          )
        ).flat();

        if (registrationTokens.length > 0) {
          response = await admin.messaging().sendMulticast({
            notification: { title: template.title, body: template.content },
            tokens: registrationTokens,
          });
        }

        users = template.users;
        break;
      case TemplateTypes.TOPIC:
        response = await Promise.all(
          template.topics.map(async (t: Topic) => {
            const send: MessagingTopicResponse = await admin
              .messaging()
              .sendToTopic(t.name, {
                notification: { title: template.title, body: template.content },
              });

            if (t.name === Topics.ALL) {
              users = await getRepository(User).find();
            } else {
              const topic: Topic = await this.topicRepository.findOne(t.id, {
                relations: ['users'],
              });

              users = [...users, ...topic.users];
            }

            return send;
          }),
        );
        break;
      default:
        break;
    }

    notices = uniqBy(users, 'id').map((user: User) => {
      const nNotice: Notification = new Notification();

      nNotice.title = template.title;
      nNotice.content = template.content;
      nNotice.user = user;

      return nNotice;
    });

    if (notices.length > 0) {
      await this.notificationRepository.save(notices);
    }

    return response;
  }

  async sendNoticeToUser({
    title,
    content,
    tokens,
    user,
  }: {
    title: string;
    content: string;
    tokens: string[];
    user: User;
  }) {
    let response: BatchResponse;

    if (tokens.length > 0) {
      response = await admin.messaging().sendMulticast({
        notification: { title, body: content },
        tokens,
      });
    }

    const nNotice: Notification = new Notification();

    nNotice.title = title;
    nNotice.content = content;
    nNotice.user = user;

    await this.notificationRepository.save(nNotice);

    return response;
  }

  /**
   * Notification Topics, admin manage
   */

  verifyFcmToken(fcmToken: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      return admin
        .messaging()
        .send(
          {
            token: fcmToken,
          },
          true,
        )
        .then(() => resolve(true))
        .catch((error: Error) => {
          console.log('🚀 ~ error', error, fcmToken);
          resolve(false);
        });
    });
  }

  async subcribeToTopic(
    fcmToken: string,
    topic: string,
  ): Promise<MessagingTopicManagementResponse> {
    return this.verifyFcmToken(fcmToken).then((valid: boolean) => {
      if (valid) {
        return admin.messaging().subscribeToTopic(fcmToken, topic);
      }
    });
  }

  async unsubscribeFromTopic(
    fcmToken: string,
    topic: string,
  ): Promise<MessagingTopicManagementResponse> {
    return this.verifyFcmToken(fcmToken).then((valid: boolean) => {
      if (valid) {
        return admin.messaging().unsubscribeFromTopic(fcmToken, topic);
      }
    });
  }

  async createTopic(
    { name: nName, description, user_ids }: CreateTopicDto,
    lang: string,
  ): Promise<Topic> {
    const name: string = removeSpecialCharacters(nName, 'upper');

    if (!name) {
      const message: string = await this.i18n.t(
        'notification.topic.name_invalid',
        { lang },
      );

      throw new BadRequestException(message);
    }

    const defaultTopics: string[] = Object.values(Topics);
    const isNameForbid: boolean = defaultTopics.includes(name);

    const topic: Topic = await this.topicRepository.findOne({ name });

    if (isNameForbid || topic) {
      const message: string = await this.i18n.t('notification.topic.existed', {
        lang,
      });

      throw new ForbiddenException(message);
    }

    const nTopic: Topic = new Topic();

    nTopic.name = name;
    nTopic.description = description;

    const users: User[] = await getRepository(User).find({
      id: In(user_ids),
    });

    nTopic.users = users;

    const create: Topic = await this.topicRepository.save(nTopic);

    const registrationTokens: string[] = (
      await Promise.all(
        user_ids.map(
          async (userId: number) =>
            await this.deviceService.findFcmByUser(userId),
        ),
      )
    ).flat();

    if (registrationTokens.length > 0) {
      await admin.messaging().subscribeToTopic(registrationTokens, name);
    }

    return create;
  }

  async findTopic(query: ListTopicDto): Promise<List<Topic>> {
    const {
      page,
      page_size,
      sort_by = SortByTopic.ID,
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
      name?: FindOperator<string>;
    } = {};

    const nName: string = name;

    if (nName) {
      filters.name = Raw(
        (alias: string) => `LOWER(${alias}) Like '%${lowerCase(nName)}%'`,
      );
    }

    const [data, total]: [Topic[], number] =
      await this.topicRepository.findAndCount({
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

  async findOneTopic(id: number, lang: string): Promise<Topic> {
    const topic: Topic = await this.topicRepository.findOne(id, {
      relations: ['users', 'templates'],
    });

    if (!topic) {
      const message: string = await this.i18n.t(
        'notification.topic.not_found',
        {
          lang,
        },
      );

      throw new NotFoundException(message);
    }

    return topic;
  }

  async findTopicByUser(user: User): Promise<Topic[]> {
    return await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.users', 'users')
      .where('users.id = :id', { id: user.id })
      .getMany();
  }

  async updateTopic(
    id: number,
    { name: nName, description, user_ids }: UpdateTopicDto,
    lang: string,
  ): Promise<Topic> {
    const name: string = removeSpecialCharacters(nName, 'upper');

    if (!name) {
      const message: string = await this.i18n.t(
        'notification.topic.name_invalid',
        { lang },
      );

      throw new BadRequestException(message);
    }

    const defaultTopics: string[] = Object.values(Topics);
    const isNameForbid: boolean = defaultTopics.includes(name);

    const topic: Topic = await this.findOneTopic(id, lang);
    const isTopicDefault: boolean = defaultTopics.includes(topic.name);
    const isRename: boolean = topic.name !== name;

    if (isTopicDefault && isRename) {
      const message: string = await this.i18n.t(
        'notification.topic.change_name_default',
        {
          lang,
        },
      );

      throw new NotAcceptableException(message);
    }

    if (isNameForbid && !isTopicDefault) {
      const message: string = await this.i18n.t('notification.topic.unique', {
        lang,
        args: { topicName: name },
      });

      throw new NotAcceptableException(message);
    }

    const oldUserIds: number[] = topic.users.map((user: User) => user.id);
    const userIdsUnsubscribe: number[] = isRename
      ? oldUserIds
      : difference(oldUserIds, user_ids);

    if (topic.name !== Topics.ALL) {
      const users: User[] = await getRepository(User).find({
        id: In(user_ids),
      });

      topic.users = users;

      // Unsubscribe user token not to be selected
      const registrationTokensUnsubscribe: string[] = (
        await Promise.all(
          userIdsUnsubscribe.map(
            async (userId: number) =>
              await this.deviceService.findFcmByUser(userId),
          ),
        )
      ).flat();

      if (registrationTokensUnsubscribe.length > 0) {
        await admin
          .messaging()
          .unsubscribeFromTopic(registrationTokensUnsubscribe, topic.name);
      }

      // Subscribe new user token to topic
      const registrationTokens: string[] = (
        await Promise.all(
          user_ids.map(
            async (userId: number) =>
              await this.deviceService.findFcmByUser(userId),
          ),
        )
      ).flat();

      if (registrationTokens.length > 0) {
        await admin.messaging().subscribeToTopic(registrationTokens, name);
      }
    }

    if (!isNameForbid && topic.deleteable) {
      topic.name = name;
    }

    topic.description = description;

    return await this.topicRepository.save(topic);
  }

  async removeTopic(id: number, lang: string): Promise<any> {
    const topic: Topic = await this.findOneTopic(id, lang);

    if (!topic.deleteable) {
      const message: string = await this.i18n.t(
        'notification.topic.deleteable',
        {
          lang,
          args: { topicName: topic.name },
        },
      );

      throw new ForbiddenException(message);
    }

    const response: DeleteResult = await this.topicRepository.delete(id);

    const registrationTokens: string[] = (
      await Promise.all(
        topic.users.map(
          async (user: User) => await this.deviceService.findFcmByUser(user.id),
        ),
      )
    ).flat();

    if (registrationTokens.length > 0) {
      await admin
        .messaging()
        .unsubscribeFromTopic(registrationTokens, topic.name);
    }

    return response;
  }

  /**
   * Notification of user
   */

  async createNotice(
    { title, content }: CreateNotificationDto,
    user: User,
  ): Promise<Notification> {
    const notification: Notification = new Notification();

    notification.title = title;
    notification.content = content;
    notification.user = user;

    return await this.notificationRepository.save(notification);
  }

  async findMyNotice(
    query: ListNotificationDto,
    user: User,
  ): Promise<List<Notification>> {
    const {
      page,
      page_size,
      sort_by = SortByNotification.ID,
      order_by = OrderBy.ASC,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +page_size;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      user: Record<string, number>;
    } = {
      user: { id: user.id },
    };

    const [data, total]: [Notification[], number] =
      await this.notificationRepository.findAndCount({
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

  async findOneNotice(
    id: number,
    user: User,
    lang: string,
  ): Promise<Notification> {
    const notification: Notification =
      await this.notificationRepository.findOne({ id, user: { id: user.id } });

    if (!notification) {
      const message: string = await this.i18n.t('notification.not_found', {
        lang,
      });

      throw new NotFoundException(message);
    }

    return notification;
  }

  async readNotice(
    { id }: ReadNotificationDto,
    user: User,
    lang: string,
  ): Promise<Notification> {
    const notification = await this.findOneNotice(id, user, lang);

    notification.is_read = true;

    return await this.notificationRepository.save(notification);
  }

  async readAllNotice(user: User): Promise<UpdateResult> {
    return await this.notificationRepository.update(
      { user: { id: user.id } },
      { is_read: true },
    );
  }

  async removeNotice(
    id: number,
    user: User,
    lang: string,
  ): Promise<DeleteResult> {
    await this.findOneNotice(id, user, lang);

    return await this.notificationRepository.delete(id);
  }

  async removeMultiNotice(
    { ids }: DeleteMultiNotificationDto,
    user: User,
  ): Promise<DeleteResult> {
    return await this.notificationRepository.delete({
      id: In(ids),
      user: { id: user.id },
    });
  }

  async removeAllNotice(user: User): Promise<DeleteResult> {
    return await this.notificationRepository.delete({ user: { id: user.id } });
  }
}
