import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DbService } from '../services/db.service';
import { FilterService } from '../services/filter.service';
import { ValidatorService } from '../services/validator.service';

import { getKeys } from '../shared/utils';

import { PopupReturn } from '../model/shared.model';
import { GymProps, GymBadge } from '../model/gym.model';

@Component({
  selector: 'app-gym-popup',
  templateUrl: './gym-popup.component.html',
  styleUrls: ['./gym-popup.component.scss']
})
export class GymPopupComponent {

  oldBadge: number;
  readonly last: number;
  isGymEdit: boolean = false;

  gymUpdate: FormGroup;

  constructor(
    public popup: MatDialogRef<GymPopupComponent, PopupReturn>,
    @Inject(MAT_DIALOG_DATA) public gymData: GymProps & { pos: number[] },
    private db: DbService,
    private fs: FilterService,
    private fb: FormBuilder
  ) { 

    this.oldBadge = this.gymData.badge;

    this.last = getKeys(GymBadge).length - 1;

    this.gymUpdate = this.fb.group({
      name: ['', [Validators.required]],
      pos: ['', [Validators.required, ValidatorService.validPosition]],
      isLegacy: [''],
      imageUrl: ['', [Validators.required]]
    }, { updateOn: 'blur' });

  }

  /**
   * For convenience in the html template
   */
  get f() {
    return this.gymUpdate.controls;
  }

  upgrade() {
    if (this.gymData.badge < this.last) this.gymData.badge++;
  }

  downgrade() {
    if (this.gymData.badge > 0) this.gymData.badge--;
  }

  setBadge() {

    this.db.setGymBadge(this.gymData)
      .then(() => {
        this.popup.close({ type: 'badgeUpdate', data: this.gymData });
      })
      .catch((err) => {
        this.popup.close({ type: 'badgeUpdateFailed', data: err.message });
      });

  }

  toggleEditGym() {

    this.gymUpdate.reset({
      name: this.gymData.name,
      pos: this.gymData.pos,
      imageUrl: this.gymData.imageUrl,
      isLegacy: !!this.gymData.isLegacy
    });
    this.isGymEdit = !this.isGymEdit;
  }

  async saveGymEdit() {

    this.gymUpdate.disable();

    const payload = {...this.gymData, ...this.gymUpdate.value};

    try {

      await this.db.updateGym(payload);
      this.popup.close({ type: 'gymUpdate', data: payload });

    } catch (err) {

      this.popup.close({ type: 'gymUpdateFailed', data: err.message });
    } 
  }

}
