import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './shared/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  isOnline: boolean;
  title = 'Heriberts Mappe';

  constructor(private toast: ToastrService,
              public auth: AuthService) { }

  ngOnInit() {
    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  }

  updateStatus() {
    this.isOnline = navigator.onLine;
    this.toast.info(`You are now ${this.isOnline ? 'on' : 'off'}line!`, 'Network change');
  }

  get authenticated() {
    return this.auth.user !== null;
  }
}
