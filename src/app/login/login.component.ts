import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  message: string = 'Bitte warten...';
  isLoading = true;

  constructor(
    private auth: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit() {
  
    this.afAuth.auth.getRedirectResult().then(result => {
      if (result.user) {

        // prevent angular warning 'Navigation outside NgZone...'
        this.zone.run(() => {
          this.router.navigate(['/dashboard']);
        });

      } else {
        this.isLoading = false;
        this.message = history.state.msg || 'Bitte erstmal reinloggen';
      };
    });
  }

  googleLogin() {

    const provider = new auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    return this.auth.loginWithProvider(provider);
  }
}
