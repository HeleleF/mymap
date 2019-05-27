import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './shared/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  isOnline: boolean;
  title = 'Meine Mappe';

  constructor(private router: Router,
    private toast: ToastrService,
    private auth: AuthService) { }

  ngOnInit() {
    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  }

  gotoSettings() {
    this.router.navigate(['settings']);
  }

  updateStatus() {
    this.isOnline = navigator.onLine;
    this.toast.info(`You are now ${this.isOnline ? 'on' : 'off'}line!`, 'Network change');
  }

  get authenticated() {
    return this.auth.user !== null;
  }
}
