import { Component, OnInit } from '@angular/core';
import { DbService } from '../shared/db.service';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  badges: number[];
  user: firebase.User;

  constructor(private db: DbService, 
    private auth: AuthService) {
  }

  async ngOnInit() {

    this.user = await this.auth.getCurrentUser();
    this.badges = await this.db.getBadgeCount();
  }

}
