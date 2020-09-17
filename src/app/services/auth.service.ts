import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';

import { Observable } from 'rxjs';

/**
 * A service to handle user authentication via
 * firebase.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  user$: Observable<firebase.User | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {

    this.user$ = this.afAuth.authState;
  }

  /**
   * Performs the "sign in" process and updates
   * the user
   */
  loginWithProvider(provider: auth.AuthProvider): Promise<void> {
    return this.afAuth.signInWithRedirect(provider);
  }

  /**
   * Performs the "sign out" process and navigates
   * to the root of the app if successful
   */
  logOut(): void {

    this.afAuth.signOut()
      .then(() => {
        void this.router.navigate(['/login'], { state: { msg: 'So long, schlong!' } });
      })
      .catch((err: Error) => {
        // eslint-disable-next-line no-console
        console.debug('Sign-Out failed', err);
      });

  }
}
