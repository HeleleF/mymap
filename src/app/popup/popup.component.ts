import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DbService } from '../services/db.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  i: number = null;

  constructor(
    public popup: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private db: DbService,
    private ms: MessageService
  ) {
    this.i = this.data.badge;
  }

  async onNoClick() {
    this.popup.close();
  }

  exclude(nr: number) {

    if (nr) {
      this.ms.excludeOneType(this.data.type);
    } else {
      this.ms.excludeOneReward(this.data.reward);
    }

    this.popup.close();
  }

  async setBadge() {

    try {

      await this.db.setGymBadge(this.data.fid, this.i);

      this.popup.close({
        badgeUpdate: this.i,
        ...this.data
      });

    } catch (e) {
      this.popup.close({error: e.message});
    }
  }

  async setStatus() {
    await this.db.setQuestStatus(this.data.fid, this.data.status);
    this.popup.close(this.data);
  }
}
