import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { getKeys } from '../shared/utils';

import { FilterSettings, Poke } from '../model/shared.model';
import { QuestType, QuestEncounter, QuestReward } from '../model/quest.model';
import { GymBadge } from '../model/gym.model';
import { FilterService } from '../services/filter.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {

  sets: FilterSettings;
  readonly types: string[];
  readonly encs: Poke[];
  readonly rewards: string[];
  readonly badges: string[];

  constructor(
    private popup: MatDialogRef<FilterComponent>,
    private fs: FilterService
  ) {

      this.sets = this.fs.filters;
      this.types = getKeys(QuestType);
      this.encs = getKeys(QuestEncounter).map((e, i) => {
        return {
          dex: i.toString().padStart(3, '0'),
          name: e
        };
      });
      this.rewards = getKeys(QuestReward);
      this.badges = getKeys(GymBadge);
  }

  changeType(t: string) {

    if (this.sets.types.includes(t)) {
      this.sets.types = this.sets.types.filter((i: string) => i !== t);
    } else {
      this.sets.types.push(t);
    }
  }

  changeReward(r: string) {

    if (this.sets.rewards.includes(r)) {
      this.sets.rewards = this.sets.rewards.filter((i: string) => i !== r);
    } else {
      this.sets.rewards.push(r);
    }
  }

  changeBadge(b: number) {

    if (this.sets.badges.includes(b)) {
      this.sets.badges = this.sets.badges.filter((i: number) => i !== b);
    } else {
      this.sets.badges.push(b);
    }
  }

  changeEncounter(e: string[]) {
    this.sets.encounters = e;
  }

  saveAndExit() {

    this.fs.persistFilters(this.sets);
    this.popup.close();
  }

  reset() {
    this.fs.persistFilters();
    this.popup.close();
  }
}
