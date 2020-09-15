import {Controller, Get, Param, Res} from '@nestjs/common';
import {AppService} from './app.service';
import {ConfigService} from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private env: ConfigService) {}

  @Get('uploads/:fileId')
  async serveImages(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, {root: this.env.get('uploadsDir')});
  }
}
