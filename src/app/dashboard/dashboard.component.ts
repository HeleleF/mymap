import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

import { UserService } from '../services/user.service';
import { GymBadge } from '../model/gym.model';
import { User } from '../model/shared.model';
import { getKeys } from '../shared/utils';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  loading = true;
  badgeCounts = [0,0,0,0];
  count = 0;
  userData: User | null = null;
  readonly badges: string[];

  constructor(
    private us: UserService,
    private toast: ToastrService
  ) {

    this.badges = getKeys(GymBadge);
  }

  ngOnInit(): void {

    this.us.getUserInfo().pipe(take(1)).subscribe({
      next: (userInfo) => {

        this.loading = false;
        this.badgeCounts = userInfo.badges;
        this.userData = userInfo.user;
        this.count = this.badgeCounts.reduce((acc, cur) => acc + cur, 0);
      },
      error: (e: Error) => {
        this.loading = false;
        this.toast.error(`Could fetch user data because: ${e.message}`, 'Dashboard Error');
      }
    });
  }

  jumpToType(ev: MouseEvent): void {
    console.log(ev.target);
  }

}
