import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import fb from 'firebase/app';

import { take } from 'rxjs/operators';

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
		// when we come back to /login from the oauth redirection flow
		void this.afAuth.getRedirectResult().then((result) => {
			if (result.user) {
				// prevent angular warning 'Navigation outside NgZone...'
				this.zone.run(() => {
					void this.router.navigate(['/dashboard']);
				});
			} else {
				this.isLoading = false;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				this.message =
					(history.state.msg as string) || 'Please login first';
			}
		});

		// when we come to /login manually
		this.as.user$.pipe(take(1)).subscribe((user) => {
			if (user) {
				this.zone.run(() => {
					void this.router.navigate(['/dashboard']);
				});
			}
		});
	}

	googleLogin(): Promise<void> {
		const provider = new fb.auth.GoogleAuthProvider();

		// necessary for testing locally with multiple accounts
		provider.setCustomParameters({ prompt: 'select_account' });

		return this.as.loginWithProvider(provider);
	}
}
