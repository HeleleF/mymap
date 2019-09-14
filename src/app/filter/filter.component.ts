import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../shared/message.service';
import { QuestType, QuestReward, QuestEncounter, FilterSettings, keys, Poke } from '../model/api.model';

import { AutochipsComponent } from '../autochips/autochips.component';

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

  constructor(private popup: MatDialogRef<FilterComponent>,
              private ms: MessageService) {

      this.sets = this.ms.getOnce();
      this.types = keys(QuestType);
      this.encs = keys(QuestEncounter).map((e, i) => {
        return {
          dex: i.toString().padStart(3, '0'),
          name: e
        };
      });
      this.rewards = keys(QuestReward);
  }

  changeType(t: string) {

    if (this.sets.types.includes(t)) {
      this.sets.types = this.sets.types.filter(i => i !== t);
    } else {
      this.sets.types.push(t);
    }
  }

  changeReward(r: string) {

    if (this.sets.rewards.includes(r)) {
      this.sets.rewards = this.sets.rewards.filter(i => i !== r);
    } else {
      this.sets.rewards.push(r);
    }
  }

  changeEncounter(e: string[]) {
    this.sets.encounters = e;
  }

  saveAndExit() {

    this.ms.persistFilters(this.sets);
    this.popup.close();
  }

  reset() {
    this.ms.persistFilters();
    this.popup.close();
  }
}
