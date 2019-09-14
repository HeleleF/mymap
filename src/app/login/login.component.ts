import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  signedIn: boolean;

  constructor(private auth: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.signedIn = false;
  }

  async loginWithGoogle() {
    this.signedIn = await this.auth.googleSignin();

    if (this.signedIn) {
      this.router.navigate(['/map']);
    }
  }
}
