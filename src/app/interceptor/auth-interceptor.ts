import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

import { AuthService } from '../shared/auth.service';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
 
  constructor(private auth: AuthService) {}
 
  intercept(req: HttpRequest<any>, next: HttpHandler) {

    // Get the auth token from the service.
    return this.auth.getAuthorizationToken().pipe(mergeMap(tok => {

      console.log(tok);

      const authReq = req.clone({
        headers: req.headers.set('Authorization', tok)
      });
   
      return next.handle(authReq);
    }));
  }
}