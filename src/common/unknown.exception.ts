import {HttpStatus, HttpException} from '@nestjs/common';

export class UnknownException extends HttpException {
  constructor() {
    super('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
