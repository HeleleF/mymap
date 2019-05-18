import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  isOnline: boolean;
  title = 'Meine Mappe';

  constructor(private router: Router) { }

  ngOnInit() {
    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  }

  gotoSettings() {
    this.router.navigate(['settings']);
  }

  updateStatus() {
    this.isOnline = navigator.onLine;
  }
}
