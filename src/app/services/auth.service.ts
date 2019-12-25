import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { User } from '../model/shared.model';

/**
 * A service to handle user authentication via
 * firebase.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  user$: Observable<User | null>;

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
        return of(null);
      })
    );
  }

  /**
   * Performs the "sign in" process and updates
   * the user
   */
  async googleSignin(): Promise<void> {

    const provider = new auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    try {

      const credentials = await this.afAuth.auth.signInWithPopup(provider);

      return this.updateUser(credentials.user);

    } catch (e) {
      console.log(e);
      return;
    }
  }

  /**
   * Performs the "sign out" process and navigates
   * to the root of the app
   */
  async signOut(): Promise<void> {
    await this.afAuth.auth.signOut();
    this.router.navigate(['/login']);
  }

  /**
   * hier könnte man zusätzliche user infos reinstecken beim anmelden
   * dafür kann man aber auch ein firebase functions trigger benutzen
   * so wie ich das ja machen will
   */
  private updateUser({ uid, photoURL, displayName }) {

    /*
    const userRef = this.afs.doc<User>(`users/${uid}`);

    const data = {
      uid, photoURL, displayName, isAdmin: false
    };

    return userRef.set(data, { merge: true });
    */

    console.log(`Firebase cloud function updating user ${displayName} with photo ${photoURL} and id ${uid}`);
    this.router.navigate(['/dashboard']);
  }
}
