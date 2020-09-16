import {resolve, join} from 'path';

export const constants = {
  appRoot: resolve(__dirname),
  uploadsDir: join(resolve(`${__dirname}/..`), '/uploads'),
};
