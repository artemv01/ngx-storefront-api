import {HttpService, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';

@Injectable()
export class ApiService {
  constructor(private http: HttpService) {}
  verifyCaptcha(token: string): Promise<any> {
    return this.http
      .post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`)
      .toPromise();
  }
}
