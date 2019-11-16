import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';

import { Datasource } from 'ngx-ui-scroll';

import { Observable, of, fromEvent } from 'rxjs';
import { map, take, shareReplay, tap } from 'rxjs/operators';

import { DbService } from '../services/db.service';
import { BadgeEntry } from '../model/gym.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  badges: number[] = [0, 0, 0, 0];
  count = 0;
  rows: BadgeEntry[];

  dsrc: Datasource;
  badgeEntries$: Observable<BadgeEntry[][]>;

  loading = true;

  user$: Observable<firebase.User>;

  @ViewChildren('badgelist') ul: QueryList<ElementRef<HTMLUListElement>>;

  constructor(private db: DbService) {

    this.badgeEntries$ = this.db.getAllBadgeEntries$().pipe(
      tap((obj) => {
        this.rows = obj.badgeRows.flat(); // used for reloading later
        this.badges = obj.badgeTypeCounts;
        this.count = this.badges.reduce((acc, cur) => acc + cur, 0);
      }),
      map(obj => obj.badgeRows),
      shareReplay() // prevents the datasource from always request everything on scroll
    );

    this.dsrc = new Datasource({
      get: (startIndex: number, cnt: number) => {

        const endIndex = startIndex + cnt;

        if (startIndex > endIndex) {
          return of([]); // empty result
        }

        return this.badgeEntries$.pipe(
          map(r => r.slice(startIndex, endIndex))
        );
      },
      settings: {
        minIndex: 0,
        startIndex: 0,
        bufferSize: 10,
      }
    });
  }

  ngOnInit() {

    this.badgeEntries$.subscribe({
      next: () => {
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.ul.changes.pipe(take(1)).subscribe((c: QueryList<ElementRef<HTMLUListElement>>) => {
      fromEvent(c.first.nativeElement, 'click').pipe(map(e => {
        return (e.target as Element).closest('div[data-sid]').getAttribute('data-sid');
      })).subscribe(n => { console.log(`clicked on row ${n}`); });

      // TODO: übergeordneten li finden, features rausholen und popup?
      // ich würd sagen brauchen wir nicht?
      // weil was sollte das popup denn anzeigen? gibt ja nichts...
    });
  }

  jumpToType(ev: Event) {
    const b = +(ev.target as HTMLElement).dataset.badge;

    // find the first occurence of this badge type
    const first = this.rows.findIndex(e => e.b === b);

    // reload scroller at that row position
    this.dsrc.adapter.reload(Math.floor(first / 3));
  }
}
