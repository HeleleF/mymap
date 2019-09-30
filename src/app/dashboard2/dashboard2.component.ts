import { Component, OnInit } from '@angular/core';
import { Datasource } from 'ngx-ui-scroll';
import { AuthService } from '../shared/auth.service';
import { DbService } from '../shared/db.service';
import { getKeys, GymBadge, BadgeEntry } from '../model/api.model';
import { of, zip, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { part, OJ } from '../shared/utils';

@Component({
  selector: 'app-dashboard2',
  templateUrl: './dashboard2.component.html',
  styleUrls: ['./dashboard2.component.scss']
})
export class Dashboard2Component implements OnInit {

  badges: number[];
  user$: Observable<firebase.User>;
  count = 0;
  readonly badgeNames: string[];
  loading = true;
  badgeRows2: Datasource;
  ALLE: BadgeEntry[][];

  ALLE$: Observable<BadgeEntry[][]>;

  constructor(private db: DbService,
              private auth: AuthService) {
    this.badgeNames = getKeys(GymBadge);
    this.ALLE$ = this.db.getAllBadgeEntries$().pipe(
      map(r => {
        this.badges = r.bcs;
        this.ALLE = OJ.part2(r.bes, 3);
        return this.ALLE;
      }),
      tap(s => console.log(s))
    );
    this.ALLE$.subscribe();
    this.badgeRows2 = new Datasource({
      get: (startIndex: number, count: number) => {

        console.log(startIndex, count);

        const endIndex = startIndex + count - 1;
        if (startIndex > endIndex) {
          return of([]);
        }

        if (this.ALLE) {
          console.log('yes');
          return of(this.ALLE.slice(startIndex, endIndex));
        } else {
          console.log('no');
          return this.ALLE$.pipe(
            map(r => {
              return this.ALLE.slice(startIndex, endIndex);
            }),
            tap(s => console.log(s))
          );
        }
      },
      settings: {
        minIndex: 0,
        startIndex: 0,
        bufferSize: 15,
        itemSize: 350,
      }
    });


  }

  ngOnInit() {

    Promise.all([this.auth.getCurrentUser(), this.db.getBadgeCount()])
    .then(([u, b]) => {
      this.loading = false;
    });

    this.user$ = this.auth.getCurrentUser$();

  }

}
