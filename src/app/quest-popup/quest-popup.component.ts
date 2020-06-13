import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DbService } from '../services/db.service';
import { FilterService } from '../services/filter.service';

import { QuestProps } from '../model/quest.model';
import { PopupReturn } from '../model/shared.model';


@Component({
  selector: 'app-quest-popup',
  templateUrl: './quest-popup.component.html',
  styleUrls: ['./quest-popup.component.scss']
})
export class QuestPopupComponent {

  constructor(
    public popup: MatDialogRef<QuestPopupComponent, PopupReturn>,
    @Inject(MAT_DIALOG_DATA) public questData: QuestProps,
    private db: DbService,
    private fs: FilterService
  ) {}

  exclude(nr: number) {

      if (nr) {
        this.fs.excludeOneType(this.questData.type);
      } else {
        this.fs.excludeOneReward(this.questData.reward);
      }
    

    this.popup.close();
  }

  setStatus() {

    this.db.setQuestStatus(this.questData.firestore_id, this.questData.status)
      .then(() => {
        this.popup.close({ type: 'questUpdate', data: this.questData });
      })
      .catch((err) => {
        console.debug(`Quest update failed`, err);
      });

  }
}
