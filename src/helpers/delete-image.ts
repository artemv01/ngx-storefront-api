import {constants} from '@app/config/constants';
import {S3} from 'aws-sdk';
import path from 'path';
import fs from 'fs';
export function deleteImage(key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (process.env.STORAGE_TYPE == 'DISK') {
      const oldImagePath = path.join(constants.uploadsDir, key);
      try {
        fs.accessSync(oldImagePath, fs.constants.F_OK | fs.constants.W_OK);
        fs.unlinkSync(oldImagePath);
        return resolve();
      } catch (e) {
        return reject(e);
      }
    } else if (process.env.STORAGE_TYPE === 'S3') {
      const s3 = new S3();
      s3.deleteObject({Bucket: process.env.AWS_PUBLIC_BUCKET, Key: key}, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    } else {
      return reject();
    }
  });
}
