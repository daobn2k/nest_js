import Device from '@modules/device/entities/device.entity';
import File from '@modules/file/entities/file.entity';
import Notification from '@modules/notification/entities/notification.entity';
import NotificationTemplate from '@modules/notification/entities/notificationTemplate.entitiy';
import NotificationTopic from '@modules/notification/entities/notificationTopic.entity';
import Role from '@modules/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface Location {
  lat: number;
  long: number;
}

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ default: '' })
  first_name: string;

  @Column({ default: '' })
  last_name: string;

  @JoinColumn({ name: 'avatar_id' })
  @OneToOne(() => File, (file) => file.uploaded_by, {
    eager: true,
    nullable: true,
  })
  avatar: File;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '', select: false })
  password: string;

  @Column({ default: '', select: false })
  refresh_token: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @ManyToMany(() => NotificationTopic, (topic) => topic.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'notification_users_topics',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topic_id', referencedColumnName: 'id' },
  })
  notification_topics: NotificationTopic[];

  @ManyToMany(() => NotificationTemplate, (template) => template.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'notification_users_templates',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'template_id', referencedColumnName: 'id' },
  })
  notification_templates: NotificationTemplate[];

  @Column({ default: '', select: false })
  google_id: string;

  @Column({ default: '', select: false })
  facebook_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}

export default User;
