import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { ToastrService } from 'ngx-toastr';

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

  async getCurrentUser() {
    return this.user;
  }

  async googleSignin() {

    const provider = new firebase.auth.GoogleAuthProvider();

    try {

      const result = await this.afAuth.auth.signInWithPopup(provider);

      this.user = result.user;
      this.toast.success(`Logged in as ${this.user.displayName}!`, 'Login');
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
      return false;

    } catch (err) {

      this.toast.error(`Logging out failed: ${err.message}`, 'Logout');
      return true;
    }
  }
}
