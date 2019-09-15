import { Component, OnInit } from '@angular/core';
import { DbService } from '../shared/db.service';
import { AuthService } from '../shared/auth.service';
import { getKeys, GymBadge } from '../model/api.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  badges: number[];
  user: firebase.User;
  count = 0;
  readonly badgeNames: string[];
  loading = true;

  constructor(private db: DbService,
              private auth: AuthService) {
                this.badgeNames = getKeys(GymBadge);
  }

  async ngOnInit() {

    this.user = await this.auth.getCurrentUser();
    this.badges = await this.db.getBadgeCount();

    this.count = this.badges.reduce((acc, cur) => acc + cur, 0);

    this.loading = false;
  }

}
