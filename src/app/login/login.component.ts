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

  message = 'Bitte warten...';
  isLoading = true;

  constructor(
    private as: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit(): void {

    void this.afAuth.getRedirectResult().then((result) => {
      if (result.user) {

        // prevent angular warning 'Navigation outside NgZone...'
        this.zone.run(() => {
          void this.router.navigate(['/dashboard']);
        });

      } else {
        this.isLoading = false;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        this.message = history.state.msg || 'Bitte erstmal reinloggen';
      }
    });
  }

  googleLogin(): Promise<void> {

    const provider = new auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    return this.as.loginWithProvider(provider);
  }
}
