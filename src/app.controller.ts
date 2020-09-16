import {Controller, Get, Param, Res} from '@nestjs/common';
import {AppService} from './app.service';
import {constants} from '@app/config/constants';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('uploads/:fileId')
  async serveImages(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, {root: constants.uploadsDir, maxAge: '1 year', lastModified: true, immutable: true});
  }
}
