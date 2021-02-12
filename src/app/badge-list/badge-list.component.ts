import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';

import { Datasource } from 'ngx-ui-scroll';

import { Observable, of, zip } from 'rxjs';
import { map, shareReplay} from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BadgeEntry } from '../model/gym.model';
import { UserService } from '../services/user.service';
import { GymService } from '../services/gym.service';
import { createRows } from '../shared/utils';
import { CustomError } from '../model/shared.model';

@Component({
  selector: 'app-badge-list',
  templateUrl: './badge-list.component.html',
  styleUrls: ['./badge-list.component.scss']
})
export class BadgeListComponent implements OnInit {

  @ViewChildren('badgelist') badgeList!: QueryList<ElementRef<HTMLUListElement>>;

  dsrc: Datasource;
  badgeEntries$: Observable<BadgeEntry[][]>;

  loading = true;

  constructor(
    private db: GymService,
    private us: UserService,
    private toast: ToastrService,
    private router: Router
  ) {

    this.badgeEntries$ = zip(this.db.getEntries(), this.us.getMedals()).pipe(
      map((data) => {

        const entries = data[0].map(entry => {

          entry.b = data[1][entry.f] || 0;

          return entry;
        }).sort((x, y) => y.b - x.b); // TODO(helene): make this into a property to be able to change it (asc/desc)

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

  ngOnInit(): void {

    this.badgeEntries$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (e: CustomError) => {
        console.log(e);
        this.toast.error(e.message, e.code, { disableTimeOut: true });
        this.loading = false;
      }
    });
  }

  onClick(gymId: string): void {
    void this.router.navigate(['map'], { fragment: gymId });
  }
}
