import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { ToastrService } from 'ngx-toastr';

import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: firebase.User = null;

  constructor(private afAuth: AngularFireAuth,
    private toast: ToastrService) { 

      this.afAuth.authState.subscribe(u => { 

        if (u) {
          this.user = u;
        }
      })
  }

  getAuthorizationToken() {

    if (this.user) {

      return from(this.user.getIdToken());

    } else {
      return from('');
    }
  }

  async googleSignin() {

    const provider = new auth.GoogleAuthProvider();

    try {

      const result = await this.afAuth.auth.signInWithPopup(provider);

      this.user = result.user;
      this.toast.success(`Logged in as ${this.user.displayName}!`, 'Login');

    } catch (err) {

      this.toast.error(`Logging in failed: ${err.message}`, 'Login');
    }

  }

  async signOut() { 

    try {

      await this.afAuth.auth.signOut();
      this.toast.success('You are now logged out!', 'Logout');
      this.user = null;

    } catch (err) {

      this.toast.error(`Logging out failed: ${err.message}`, 'Logout');
    }
  }
}
