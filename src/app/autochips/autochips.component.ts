import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { QuestEncounter, Poke } from '../model/api.model';

@Component({
  selector: 'autochips',
  templateUrl: 'autochips.component.html',
  styleUrls: ['autochips.component.scss'],
})
export class AutochipsComponent {

  formCtrl = new FormControl();
  filteredElms: Observable<Poke[]>;
  elms: Poke[] = [];

  @Input('elements') allElms: Poke[];
  @Output() updated = new EventEmitter<string[]>();

  @ViewChild('elmInput', { static: false }) elmInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  constructor() {
    this.filteredElms = this.formCtrl.valueChanges.pipe(
      startWith(null),
      map((e: Poke | null) => e ? this._filter(e) : this.allElms.slice()));
  }

  remove(e: Poke) {
    const index = this.elms.indexOf(e);

    if (index >= 0) {
      this.elms.splice(index, 1);
      this.updated.emit(this.elms.map(p => p.name));
    }
  }

  selected(event: MatAutocompleteSelectedEvent) {

    this.elms.push(event.option.value);
    this.updated.emit(this.elms.map(p => p.name));

    this.elmInput.nativeElement.value = '';
    this.formCtrl.setValue(null);
  }

  private _filter(value: string | Poke): Poke[] {

    const filterValue = 'string' === typeof value ? value.toLowerCase(): value.name.toLowerCase();

    return this.allElms.filter(e => e.name.toLowerCase().indexOf(filterValue) === 0);
  }
}
