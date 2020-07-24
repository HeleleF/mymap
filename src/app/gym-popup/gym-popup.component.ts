import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FilterService } from '../services/filter.service';
import { ValidatorService } from '../services/validator.service';

import { getKeys } from '../shared/utils';

import { PopupReturn } from '../model/shared.model';
import { GymProps, GymBadge } from '../model/gym.model';
import { GymService } from '../services/gym.service';
import { UserService } from '../services/user.service';

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
    @Inject(MAT_DIALOG_DATA) public gymData: GymProps & { position: number[], badge: number },
    private db: GymService,
    private us: UserService,
    private fs: FilterService,
    private fb: FormBuilder
  ) { 

    this.oldBadge = this.gymData.badge;

    this.last = getKeys(GymBadge).length - 1;

    this.gymUpdate = this.fb.group({
      name: ['', [Validators.required]],
      position: ['', [Validators.required, ValidatorService.validPosition]],
      isLegacy: [''],
      imageUrl: ['', [Validators.required], [ValidatorService.validGymUrl]]
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

    this.us.setBadge(this.gymData.firestoreId, this.gymData.badge)
      .then(() => {
        this.popup.close({ type: 'badgeUpdate', data: { firestoreId: this.gymData.firestoreId, newBadge: this.gymData.badge } });
      })
      .catch((err) => {
        console.log(err.code);
        this.popup.close({ type: 'badgeUpdateFailed', data: err.message });
      });

  }

  toggleEditGym() {

    this.gymUpdate.reset({
      name: this.gymData.name,
      position: this.gymData.position,
      imageUrl: this.gymData.imageUrl,
      isLegacy: !!this.gymData.isLegacy
    });
    this.isGymEdit = !this.isGymEdit;
  }

  async saveGymEdit() {

    this.gymUpdate.disable();

    const payload = {...this.gymData, ...this.gymUpdate.value};

    payload.position[0] = Math.floor(payload.position[0] * 1e6) / 1e6;
    payload.position[1] = Math.floor(payload.position[1] * 1e6) / 1e6;

    try {

      await this.db.update(payload);
      this.popup.close({ type: 'gymUpdate', data: payload });

    } catch (err) {

      this.popup.close({ type: 'gymUpdateFailed', data: err.message });
    } 
  }

}
