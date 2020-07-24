import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';

import { Datasource } from 'ngx-ui-scroll';

import { Observable, of, fromEvent, zip } from 'rxjs';
import { map, take, shareReplay, switchMapTo, switchMap, filter} from 'rxjs/operators';

import { BadgeEntry } from '../model/gym.model';
import { UserService } from '../services/user.service';
import { GymService } from '../services/gym.service';
import { createRows } from '../shared/utils';

@Component({
  selector: 'app-badge-list',
  templateUrl: './badge-list.component.html',
  styleUrls: ['./badge-list.component.scss']
})
export class BadgeListComponent implements OnInit, AfterViewInit {

  dsrc: Datasource;
  badgeEntries$: Observable<BadgeEntry[][]>;

  loading = true;
  clicks$!: Observable<string>;

  @ViewChildren('badgelist') badgeList!: QueryList<ElementRef<HTMLUListElement>>;

  constructor(
    private db: GymService, 
    private us: UserService
  ) {

    this.badgeEntries$ = zip(this.db.getEntries(), this.us.getMedals()).pipe(
      map((data) => {

        const entries = data[0].map(entry => {

          entry.b = data[1][entry.f] || 0;

          return entry;
        });
        return createRows(entries);
      }),
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
    /*
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
    */

   this.clicks$ = this.badgeList.changes.pipe(
    take(1),
    switchMap((queryList: QueryList<ElementRef<HTMLUListElement>>) => fromEvent(queryList.first.nativeElement, 'click')),
    map(ev => {

      const elm = ev.target as HTMLElement | null;
      if (!elm) return null;

      const row = elm.closest('div[data-sid]');
      if (!row) return null;

      return row.getAttribute('data-sid');
    }),
    filter((a): a is string => !!a)
  );

    this.clicks$.subscribe(n => {
      console.debug(`clicked on row ${n}`);
    })
  }

  onClick(ev: MouseEvent) {
    console.log(ev.target);
  }

}
