import {Injectable} from '@nestjs/common';
import {S3} from 'aws-sdk';
import {ManagedUpload} from 'aws-sdk/clients/s3';
import {v4 as uuid} from 'uuid';
@Injectable()
export class UploaderService {
  upload(file: Express.Multer.File): Promise<string> {
    const s3 = new S3();

    const extension = '.' + file.originalname.split('.').pop();
    const filename = uuid() + extension;

    const config: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_PUBLIC_BUCKET,
      Key: filename,
      Body: file.buffer,
      ACL: 'public-read',
    };
    return new Promise((resolve, reject) => {
      s3.upload(config, (err, data: ManagedUpload.SendData) => {
        if (err) {
          return reject(err);
        }
        return resolve(data?.Location);
      });
    });
  }
  delete(file: string): Promise<void> {
    const s3 = new S3();
    const key = file.split('/').pop();
    return new Promise((resolve, reject) => {
      s3.deleteObject({Bucket: process.env.AWS_PUBLIC_BUCKET, Key: key}, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}
