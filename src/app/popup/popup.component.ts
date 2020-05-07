import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DbService } from '../services/db.service';
import { FilterService } from '../services/filter.service';
import { ValidatorService } from '../services/validator.service';

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

  gymUpdate: FormGroup;

  constructor(
    public popup: MatDialogRef<PopupComponent, PopupReturn>,
    @Inject(MAT_DIALOG_DATA) public data: GymProps & { pos: number[] } | QuestProps,
    private db: DbService,
    private fs: FilterService,
    private fb: FormBuilder
  ) {

    if (!this.isQuest(this.data)) {
      this.oldBadge = this.data.badge;
    }
    this.last = getKeys(GymBadge).length - 1;

    this.gymUpdate = this.fb.group({
      name: ['', [Validators.required]],
      pos: ['', [Validators.required, ValidatorService.validPosition]],
      isLegacy: [''],
      imageUrl: ['', [Validators.required]]
    }, { updateOn: 'blur' });
  }

  private isQuest(p: GymProps | QuestProps): p is QuestProps {
    return (p as QuestProps).taskDesc !== undefined;
  }

  get f() {
    return this.gymUpdate.controls;
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

    if (this.isQuest(this.data)) return;
    
    this.gymUpdate.reset({
      name: this.data.name,
      pos: this.data.pos,
      imageUrl: this.data.imageUrl,
      isLegacy: !!this.data.isLegacy
    });
    this.isGymEdit = !this.isGymEdit;
  }

  async saveGymEdit() {

    if (this.isQuest(this.data)) return;

    this.gymUpdate.disable();

    const payload = {...this.data, ...this.gymUpdate.value};

    try {

      await this.db.updateGym(payload);
      this.popup.close({ type: 'gymUpdate', data: payload });

    } catch (err) {

      this.popup.close({ type: 'gymUpdateFailed', data: err.message });
    } 
  }
}
