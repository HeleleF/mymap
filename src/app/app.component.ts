import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { User } from './model/shared.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  isOnline: boolean;
  title = 'Helenchen\'s Web App';

  constructor(
    private toast: ToastrService,
    public auth: AuthService,
    public userService: UserService
  ) {
    this.isOnline = navigator.onLine;
   }

  ngOnInit(): void {
    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  }

  get user$(): Observable<User | null> {
    return this.userService.getCurrentUser();
  }

  private updateStatus() {
    this.isOnline = navigator.onLine;
    this.toast.info(`You are now ${this.isOnline ? 'on' : 'off'}line!`, 'Network change');
  }
}
