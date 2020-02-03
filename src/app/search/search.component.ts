import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService } from '../services/message.service';

/**
 * @title Filter autocomplete
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

  searchControl = new FormControl();

  allGyms: string[] = ['One', 'Two', 'Three'];
  filteredGyms!: Observable<string[]>;

  constructor(private ms: MessageService) {

  }

  ngOnInit() {
    this.filteredGyms = this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(1000),
        distinctUntilChanged(),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allGyms.filter(gym => gym.toLowerCase().includes(filterValue));
  }

  onGymSelected(event: MatAutocompleteSelectedEvent) {

    const gym = event.option.value;
    console.log(gym);

    this.ms.broadcast({ type: 'selectGym', data: gym });

  }
}
