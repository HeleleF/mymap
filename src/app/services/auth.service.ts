import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { User } from '../model/shared.model';

/**
 * A service to handle user authentication via
 * firebase.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  user$: Observable<User | undefined>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {

    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        }
        return of(undefined);
      })
    );
  }

  /**
   * Performs the "sign in" process and updates
   * the user
   */
  googleSignin() {

    const provider = new auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    this.afAuth.auth.signInWithPopup(provider)
      .then(() => {
        console.debug(`Firebase cloud function updating user`);
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        console.debug(`Sign-In failed`, err);
      });
  }

  /**
   * Performs the "sign out" process and navigates
   * to the root of the app if successful
   */
  signOut() {

    this.afAuth.auth.signOut()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        console.debug(`Sign-Out failed`, err);
      });

  }
}
