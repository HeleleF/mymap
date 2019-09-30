import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: firebase.User = null;

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private toast: ToastrService) {

      this.afAuth.authState.subscribe(u => { // TODO: this.user ersetzen durch this.user$, und direkt authState zuordnen

        if (u) {
          this.user = u;
        }
      });
  }

  getCurrentUser() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  getCurrentUser$() {
    return this.afAuth.authState.pipe(first());
  }

  async googleSignin() {

    try {

      const result = await this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); // TODO: mit redirect wäre noch cooler

      this.user = result.user;
      this.toast.success(`Logged in as ${this.user.displayName}!`, 'Login'); // TODO: toaster rausnehmen
      return true;

    } catch (err) {

      this.toast.error(`Logging in failed: ${err.message}`, 'Login');
      return false;
    }

  }

  async signOut() {

    try {

      await this.afAuth.auth.signOut();
      this.user = null;
      this.toast.success('You are now logged out!', 'Logout');
      this.router.navigate(['/login']);
      return false;

    } catch (err) {

      this.toast.error(`Logging out failed: ${err.message}`, 'Logout');
      return true;
    }
  }
}
