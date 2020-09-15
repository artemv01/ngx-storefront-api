import moduleAlias from 'module-alias';
import path from 'path';

moduleAlias.addAliases({
  '@app': path.resolve(__dirname, '..', '..', 'dist', 'src'),
  '@env': path.resolve(__dirname, '..', '..', 'environments'),
  '@root/*': path.resolve(__dirname, '..', '..'),
});
