import { NotAcceptableException } from '@nestjs/common';
import { extname } from 'path';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|heic)$/)) {
    return callback(
      new NotAcceptableException('Only image files are allowed!'),
      false,
    );
  }

  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const name: string = file.originalname.split('.')[0];

  const fileExtName: string = extname(file.originalname);

  const randomName: string = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  callback(null, `${name}-${randomName}${fileExtName}`);
};
