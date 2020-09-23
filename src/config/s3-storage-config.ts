import {S3} from 'aws-sdk';
const s3 = new S3();
import {v4 as uuid} from 'uuid';
export const s3StorageConfig = {
  s3: s3,
  bucket: process.env.AWS_PUBLIC_BUCKET,
  key: function(req, file, cb) {
    const extension = '.' + file.originalname.split('.').pop();
    const filename = uuid() + extension;
    cb(null, filename);
  },
  acl: 'public-read',
};
