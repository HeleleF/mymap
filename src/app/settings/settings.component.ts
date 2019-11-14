import { Component, OnDestroy } from '@angular/core';

import { getKeys } from '../shared/utils';
import { MapStyle } from '../model/api.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnDestroy {

  currentStyle: string;
  styles: string[];

  constructor() {
    this.styles = [...getKeys(MapStyle), 'Auto'];
    this.currentStyle = localStorage.getItem('mapStyle') || 'Auto';
  }

  ngOnDestroy() {
    localStorage.setItem('mapStyle', this.currentStyle);
  }
}
