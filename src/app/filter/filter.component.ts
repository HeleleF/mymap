import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { getKeys } from '../shared/utils';

import { FilterSettings } from '../model/shared.model';
import { GymBadge } from '../model/gym.model';
import { FilterService } from '../services/filter.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {

  sets: FilterSettings;
  readonly badges: string[];

  constructor(
    private popup: MatDialogRef<FilterComponent>,
    private fs: FilterService
  ) {
      this.sets = this.fs.filters;
      this.badges = getKeys(GymBadge);
  }

  changeBadge(b: number): void {

    if (this.sets.badges.includes(b)) {
      this.sets.badges = this.sets.badges.filter(i => i !== b);
    } else {
      this.sets.badges.push(b);
    }
  }

  saveAndExit(): void {
    this.fs.persistFilters(this.sets);
    this.popup.close();
  }

  reset(): void {
    this.fs.persistFilters();
    this.popup.close();
  }
}
