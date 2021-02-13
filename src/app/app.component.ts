import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

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
    public aus: AuthService,
    public us: UserService,
    private swUpdate: SwUpdate
  ) {
    this.isOnline = navigator.onLine;
   }

  ngOnInit(): void {

    // watch for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.toast.info('Click to reload!', 'App Update', {
          disableTimeOut: true,
        })
          .onTap
          .pipe(take(1))
          .subscribe(() => void this.swUpdate.activateUpdate().then(() => document.location.reload()));
      });
    }

    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  }

  get user$(): Observable<User | null> {
    return this.us.getCurrentUser();
  }

  private updateStatus() {
    this.isOnline = navigator.onLine;
    this.toast.info(`You are now ${this.isOnline ? 'on' : 'off'}line!`, 'Network change');
  }
}
