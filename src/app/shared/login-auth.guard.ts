import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';

import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoginAuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /**
   * Restricts the 'login' route
   * to users that are not logged in.
   */
  canActivate(): Observable<boolean> {

    return this.auth.user$.pipe(
      take(1),
      map(user => !user),
      tap(isLoggedOut => {
        if (!isLoggedOut) {
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }
}
