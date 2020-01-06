import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DbService } from '../services/db.service';
import { FilterService } from '../services/filter.service';

import { getKeys } from '../shared/utils';

import { GymProps, GymBadge } from '../model/gym.model';
import { QuestProps } from '../model/quest.model';
import { PopupReturn } from '../model/shared.model';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  oldBadge: number | undefined;
  readonly last: number;
  isGymEdit: boolean = false;

  constructor(
    public popup: MatDialogRef<PopupComponent, PopupReturn>,
    @Inject(MAT_DIALOG_DATA) public data: GymProps | QuestProps,
    private db: DbService,
    private fs: FilterService
  ) {

    if (!this.isQuest(this.data)) {
      this.oldBadge = this.data.badge;
    }
    this.last = getKeys(GymBadge).length - 1;
  }

  private isQuest(p: GymProps | QuestProps): p is QuestProps {
    return (p as QuestProps).taskDesc !== undefined;
  }

  upgrade() {
    if (this.isQuest(this.data)) return;
    if (this.data.badge < this.last) this.data.badge++;
  }

  downgrade() {
    if (this.isQuest(this.data)) return;
    if (this.data.badge > 0) this.data.badge--;
  }

  exclude(nr: number) {

    if (this.isQuest(this.data)) {
      if (nr) {
        this.fs.excludeOneType(this.data.type);
      } else {
        this.fs.excludeOneReward(this.data.reward);
      }
    }

    this.popup.close();
  }

  setBadge() {

    if (this.isQuest(this.data)) return;

    this.db.setGymBadge(this.data)
      .then(() => {
        this.popup.close({ type: 'badgeUpdate', data: this.data });
      })
      .catch((err) => {
        this.popup.close({ type: 'badgeUpdateFailed', data: err.message });
      });

  }

  setStatus() {
    if (!this.isQuest(this.data)) return;

    this.db.setQuestStatus(this.data.firestore_id, this.data.status)
      .then(() => {
        this.popup.close({ type: 'questUpdate', data: this.data });
      })
      .catch((err) => {
        console.debug(`Quest update failed`, err);
      });

  }

  toggleEditGym() {
    this.isGymEdit = !this.isGymEdit;
  }

  saveGymEdit() {

    if (this.isQuest(this.data)) return;

    this.db.updateGym(this.data)
    .then(() => {
      // this.popup.close({ type: 'gymUpdate', data: this.data });
      this.isGymEdit = false;
    })
    .catch((err) => {
      // this.popup.close({ type: 'gymUpdateFailed', data: err.message });
      this.isGymEdit = false;
    });
  }
}
