import {resolve, join} from 'path';

export const environment = () => ({
  jwtExpire: 604800000,
  jwtSecret: 'secure',
  appRoot: resolve(__dirname),
  uploadsDir: join(resolve(`${__dirname}/..`), '/uploads'),
});
