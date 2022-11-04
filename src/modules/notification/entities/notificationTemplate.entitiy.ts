import User from '@modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import NotificationTopic from './notificationTopic.entity';

export enum TemplateTypes {
  USER = 'USER',
  TOPIC = 'TOPIC',
}

@Entity()
class NotificationTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: '' })
  content: string;

  @Column()
  type: TemplateTypes;

  @ManyToMany(() => User, (user) => user.notification_templates, {
    onDelete: 'CASCADE',
  })
  users: User[];

  @ManyToMany(() => NotificationTopic, (topic) => topic.templates, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'notification_templates_topics',
    joinColumn: { name: 'template_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topic_id', referencedColumnName: 'id' },
  })
  topics: NotificationTopic[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}

export default NotificationTemplate;
