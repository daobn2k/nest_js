export enum UserApis {
  ADD_USER = 'ADD_USER',
  VIEW_USER = 'VIEW_USER',
  EDIT_USER = 'EDIT_USER',
  DELETE_USER = 'DELETE_USER',
}

export enum RoleApis {
  ADD_ROLE = 'ADD_ROLE',
  VIEW_ROLE = 'VIEW_ROLE',
  EDIT_ROLE = 'EDIT_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',
}

export enum PermissionApis {
  ADD_PERMISSION = 'ADD_PERMISSION',
  VIEW_PERMISSION = 'VIEW_PERMISSION',
  EDIT_PERMISSION = 'EDIT_PERMISSION',
  DELETE_PERMISSION = 'DELETE_PERMISSION',
}

export enum FileApis {
  VIEW_FILE = 'VIEW_FILE',
  DELETE_FILE = 'DELETE_FILE',
}

export enum FaqApis {
  ADD_FAQ = 'ADD_FAQ',
  VIEW_FAQ = 'VIEW_FAQ',
  EDIT_FAQ = 'EDIT_FAQ',
  DELETE_FAQ = 'DELETE_FAQ',
}

export enum NotificationApis {
  ADD_TOPIC = 'ADD_TOPIC',
  VIEW_TOPIC = 'VIEW_TOPIC',
  EDIT_TOPIC = 'EDIT_TOPIC',
  DELETE_TOPIC = 'DELETE_TOPIC',

  ADD_TEMPLATE = 'ADD_TEMPLATE',
  VIEW_TEMPLATE = 'VIEW_TEMPLATE',
  EDIT_TEMPLATE = 'EDIT_TEMPLATE',
  DELETE_TEMPLATE = 'DELETE_TEMPLATE',

  SEND_NOTICE = 'SEND_NOTICE',
}

export const apis: string[] = [
  ...Object.values(UserApis),
  ...Object.values(RoleApis),
  ...Object.values(PermissionApis),
  ...Object.values(FileApis),
  ...Object.values(FaqApis),
  ...Object.values(NotificationApis),
];

export const AllApiRequiredPermission = [
  { group: 'User', apis: Object.values(UserApis) },
  { group: 'Role', apis: Object.values(RoleApis) },
  { group: 'Permission', apis: Object.values(PermissionApis) },
  { group: 'File', apis: Object.values(FileApis) },
  { group: 'Faq', apis: Object.values(FaqApis) },
  { group: 'Notification', apis: Object.values(NotificationApis) },
];
