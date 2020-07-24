import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


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
  loginWithProvider(provider: auth.AuthProvider) {
    return this.afAuth.auth.signInWithRedirect(provider);
  }

  /**
   * Performs the "sign out" process and navigates
   * to the root of the app if successful
   */
  logOut() {

    this.afAuth.auth.signOut()
      .then(() => {
        this.router.navigate(['/login'], { state: { msg: 'So long, schlong!' } });
      })
      .catch((err) => {
        console.debug(`Sign-Out failed`, err);
      });

  }
}
