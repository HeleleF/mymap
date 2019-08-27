import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DbService } from '../shared/db.service';
import { MessageService } from '../shared/message.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  private x0: number = null;
  private i: number = null;

  constructor(public popup: MatDialogRef<PopupComponent>, 
    @Inject(MAT_DIALOG_DATA) public data,
    private db: DbService,
    private ms: MessageService) { 
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
      await this.db.setGymBadge(this.data.fid, this.i);
      this.popup.close({
        badgeUpdate: this.i, 
        ...this.data
      });
    }

    async setStatus() {
      await this.db.setQuestStatus(this.data.fid, this.data.status);
      this.popup.close(this.data);
    }

    private unify(e: TouchEvent | MouseEvent) {
      return e instanceof TouchEvent ? e.changedTouches[0] : e;
    }

    private lock(e: TouchEvent | MouseEvent) {
      this.x0 = this.unify(e).clientX;
    }

    private move(e: TouchEvent | MouseEvent) {
      if (this.x0) {

        let dx = this.unify(e).clientX - this.x0,
            s = Math.sign(dx);

        if (Math.abs(dx) < 80) return;

        0 > s ? 4 > this.i && this.i++ : 0 < this.i && this.i--;
        this.x0 = null;

        console.log(this.i);
    }
  }

}
