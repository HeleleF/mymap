import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from '../shared/message.service';
import { ValidatorService } from './new-gym.validators';

@Component({
  selector: 'app-new-gym',
  templateUrl: './new-gym.component.html',
  styleUrls: ['./new-gym.component.scss']
})
export class NewGymComponent {

  gymData: FormGroup;

  constructor(private popup: MatDialogRef<NewGymComponent>,
              private vs: ValidatorService,
              private fb: FormBuilder,
              private ms: MessageService) {
      this.gymData = this.fb.group({
        name: ['', [Validators.required]],
        pos: ['', [Validators.required, this.vs.createGymPositionValidator()]],
        id: ['', [Validators.required, this.vs.createGymIdValidator()]],
        url: ['', [Validators.required], [this.vs.createGymUrlValidator()]],
        badge: [0, [this.vs.createGymBadgeValidator()]],
      }, {updateOn: 'blur'});
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

  create() {

    const v = this.gymData.value;

    const { groups : { lat, lng } } = /^(?<lat>\d{2}\.\d+)\,(?<lng>\d{2}\.\d+)$/.exec(v.pos);

    this.ms.addGym({
      b: v.badge,
      d: v.name,
      i: v.id,
      lat: Math.floor(parseFloat(lat) * 1e6) / 1e6,
      lon: Math.floor(parseFloat(lng) * 1e6) / 1e6,
      u: v.url.replace(/^https?\:\/\//, '')
    });
    this.popup.close();
  }

}
