import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoginAuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /**
   * Restricts a route
   * to users that are not logged in.
   */
  canActivate(): Observable<boolean> {

    return this.auth.user$.pipe(
      take(1),
      map(user => !user),
      tap(isLoggedOut => {
        console.debug('%cGUARD', 'color:#B0FF0A; font-size: large', isLoggedOut);
        if (!isLoggedOut) {
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }
}
