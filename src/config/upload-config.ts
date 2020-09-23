import {HttpException} from '@nestjs/common';
import {diskStorage} from 'multer';
import {diskStorageConfig} from './dist-storage-config';
import {s3StorageConfig} from './s3-storage-config';
import multerS3 from 'multer-s3';

export const uploadConfig = {
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return callback(new HttpException('Only image files are allowed!', 500), false);
    }
    callback(null, true);
  },
  storage: process.env.STORAGE_TYPE === 'DISK' ? diskStorage(diskStorageConfig) : multerS3(s3StorageConfig),
};
