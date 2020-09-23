import {constants} from '@app/config/constants';
import {extname} from 'path';
import {v4 as uuid} from 'uuid';
export const diskStorageConfig = {
  destination: constants.uploadsDir,
  filename: (req, file, cb) => {
    const extension = '.' + file.originalname.split('.').pop();
    const filename = uuid() + extension;
    cb(null, filename);
  },
};
