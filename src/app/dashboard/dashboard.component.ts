import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { DbService } from '../shared/db.service';
import { AuthService } from '../shared/auth.service';
import { getKeys, GymBadge, BadgeEntry } from '../model/api.model';
import { Datasource, IDatasource } from 'ngx-ui-scroll';
import { Observable, of, fromEvent } from 'rxjs';
import { map, tap, take, pluck } from 'rxjs/operators';
import { part } from '../shared/utils';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  badges: number[];
  user: firebase.User;
  count = 0;
  readonly badgeNames: string[];
  loading = true;
  badgeRows: IDatasource;
  testOb: Observable<BadgeEntry[]>;

  @ViewChildren('badgelist') ul: QueryList<ElementRef<HTMLUListElement>>;

  constructor(private db: DbService,
              private auth: AuthService) {
    this.badgeNames = getKeys(GymBadge);
    this.badgeRows = {
      get: (startIndex: number, cnt: number) => {

        const count = cnt * 3;
        const endIndex = startIndex + count - 1;

        console.log(startIndex, count);

        if (startIndex > endIndex) {
          return of([]); // empty result
        }

        const startPage = Math.floor(startIndex / DbService.ROW_SIZE);
        const endPage = Math.floor(endIndex / DbService.ROW_SIZE);

        const start = startIndex - startPage * DbService.ROW_SIZE;
        const end = start + endIndex - startIndex + 1;

        return this.db.getRows(startPage, endPage).pipe(
          map(rows => part(rows.flat().slice(start, end), 3))
        );
      },
      settings: {
        minIndex: 0,
        padding: 1.0,
        startIndex: 0,
        itemSize: 350,
      },
      devSettings: {
        debug: true,
      }
    };
  }

  ngOnInit() {

    // das alles hier kann in obersables umgebaut werden
    // rxjs hat auch reduce

    Promise.all([this.auth.getCurrentUser(), this.db.getBadgeCount()])
      .then(([u, b]) => {
        this.user = u;
        this.badges = b;
        this.count = this.badges.reduce((acc, cur) => acc + cur, 0);

        this.loading = false;
      });
  }

  ngAfterViewInit() {
    this.ul.changes.pipe(take(1)).subscribe((c: QueryList<ElementRef<HTMLUListElement>>) => {
      fromEvent(c.first.nativeElement, 'click').pipe(pluck('target')).subscribe(console.log);

      // TODO: übergeordneten li finden, features rausholen und popup?
    });
  }
}
