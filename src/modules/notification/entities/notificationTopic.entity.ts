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
import NotificationTemplate from './notificationTemplate.entitiy';

@Entity()
class NotificationTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: true })
  deleteable: boolean;

  @ManyToMany(() => User, (user) => user.notification_topics, {
    onDelete: 'CASCADE',
  })
  users: User[];

  @ManyToMany(() => NotificationTemplate, (template) => template.topics, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'notification_templates_topics',
    joinColumn: { name: 'topic_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'template_id', referencedColumnName: 'id' },
  })
  templates: NotificationTemplate[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}

export default NotificationTopic;
