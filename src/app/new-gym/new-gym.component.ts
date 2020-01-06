import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MessageService } from '../services/message.service';
import { ValidatorService } from '../services/validator.service';
import { DbService } from '../services/db.service';

import { getKeys } from '../shared/utils';
import { GymBadge } from '../model/gym.model';

@Component({
  selector: 'app-new-gym',
  templateUrl: './new-gym.component.html',
  styleUrls: ['./new-gym.component.scss']
})
export class NewGymComponent {

  gymData: FormGroup;
  readonly badges: string[];

  constructor(
    private popup: MatDialogRef<NewGymComponent>,
    private vs: ValidatorService,
    private fb: FormBuilder,
    private db: DbService,
    private ms: MessageService
  ) {
    this.badges = getKeys(GymBadge);
    this.gymData = this.fb.group({
      name: ['', [Validators.required]],
      pos: ['', [Validators.required, this.vs.createGymPositionValidator()]],
      id: ['', [Validators.required, this.vs.createGymIdValidator()]],
      url: ['', [Validators.required], [this.vs.createGymUrlValidator()]],
      badge: ['', [Validators.required, this.vs.createGymBadgeValidator()]],
    }, { updateOn: 'blur' });
  }

  getNameError() {
    return this.gymData.hasError('required', 'name') ? 'Gym name is required' : '';
  }

  getIdError() {
    return this.gymData.hasError('required', 'id') ? 'Gym ID is required' :
      this.gymData.hasError('wrongFormat', 'id') ? 'Wrong ID format' : '';
  }

  getPosError() {
    return this.gymData.hasError('required', 'pos') ? 'Gym position is required' :
      this.gymData.hasError('malformedPos', 'pos') ? 'Wrong format' : '';
  }

  getUrlError() {
    return this.gymData.hasError('required', 'url') ? 'Gym url is required' :
      this.gymData.hasError('noUrl', 'url') ? 'Not a valid url' :
        this.gymData.hasError('noImage', 'url') ? 'Not a valid image' : '';
  }

  getBadgeError() {
    return this.gymData.hasError('wrongBadge', 'badge') ? 'Not a valid badge' : '';
  }

  get f() {
    return this.gymData.controls;
  }

  close() {
    this.gymData.reset();
  }

  onPaste(ev: ClipboardEvent) {

    // prevent actually pasting the content directly
    ev.preventDefault();

    const dataTransfer = ev.clipboardData;
    if (!dataTransfer) return;

    const data = dataTransfer.getData('text');
    if (!data) return;

    this.gymData.setValue(this.vs.parseAndValidate(data));
  }

  create() {

    const v = this.gymData.value;
    this.gymData.disable();

    const match = /^(?<lat>\d{2}\.\d+)\,(?<lng>\d{2}\.\d+)$/.exec(v.pos);

    if (!match || !match.groups) {
      // this should never happen since the value of "v.pos" is checked
      // during validation
      this.gymData.reset();
      return;
    };

    const { lat, lng } = match.groups;

    this.db.addGym({
      b: +GymBadge[v.badge],
      d: v.name,
      i: v.id,
      lat: Math.floor(parseFloat(lat) * 1e6) / 1e6,
      lon: Math.floor(parseFloat(lng) * 1e6) / 1e6,
      u: v.url.replace(/^https?\:\/\//, '')
    }).subscribe((newGym) => {

      if (newGym) {
        this.ms.broadcast({ type: 'newGym', data: newGym });
      } else {
        this.ms.fail({ type: 'Gym', err: `Couldn't add "${v.name}" because:` });
      }
      
      this.popup.close();
    });  
  }
}
