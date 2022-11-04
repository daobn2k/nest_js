import User from '@modules/user/entities/user.entity';
import { trim } from 'lodash';

export const getNameUser = (user: User): string =>
  trim(`${user.first_name || ''} ${user.last_name || ''}`) || user.email;
