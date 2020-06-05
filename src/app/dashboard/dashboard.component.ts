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
  rows: BadgeEntry[] = [];

  dsrc: Datasource;
  badgeEntries$: Observable<BadgeEntry[][]>;

  loading = true;

  @ViewChildren('badgelist') badgeList!: QueryList<ElementRef<HTMLUListElement>>;

  constructor(private db: DbService) {

    this.badgeEntries$ = this.db.getAllBadgeEntries().pipe(
      tap((d) => {
        this.rows = d.badgeRows.flat(); // used for reloading later
        this.badges = d.badgeTypeCounts;
        this.count = this.badges.reduce((acc, cur) => acc + cur, 0);
      }),
      map(d => d.badgeRows),
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
    this.badgeList.changes.pipe(take(1)).subscribe({
      next: (queryList: QueryList<ElementRef<HTMLUListElement>>) => {

        fromEvent(queryList.first.nativeElement, 'click').pipe(
          map(ev => {

            const elm = ev.target as HTMLElement | null;
            if (!elm) return null;

            const row = elm.closest('div[data-sid]');
            if (!row) return null;

            return row.getAttribute('data-sid');
          })
        ).subscribe(n => {
          console.debug(`clicked on row ${n}`);
        });

        // TODO: übergeordneten li finden, features rausholen und popup?
        // ich würd sagen brauchen wir nicht?
        // weil was sollte das popup denn anzeigen? gibt ja nichts...
      }
    });
  }

  /**
   * Reloads the scroller source to start at the first occurence of the
   * clicked badge type
   */
  jumpToType(ev: MouseEvent | TouchEvent) {

    const elm = ev.target as HTMLElement | null;
    if (!elm || !elm.dataset) return;

    // find the first occurence of this badge type
    const badgeTyp = Number(elm.dataset.badge);
    const first = this.rows.findIndex(e => e.b === badgeTyp);

    if (first !== -1) {
      // reload scroller at that row position
      this.dsrc.adapter.reload(Math.floor(first / 3));
    }
  }
}
