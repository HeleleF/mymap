import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { FilterSettings } from '../model/shared.model';

/**
 * A Service to handle the map filters.
 *
 * This uses a BehaviourSubject to pass a starting value to
 * subscribers when initally subscribing. (which is needed when the map
 * needs to apply filters from previous visits)
 */
@Injectable({
  providedIn: 'root'
})
export class FilterService {

  filters: FilterSettings;
  private filters$: BehaviorSubject<FilterSettings>;

  constructor() {

    const f = localStorage.getItem('filters');

    this.filters = f ? JSON.parse(f) as FilterSettings : this.defaults;
    this.filters$ = new BehaviorSubject(this.filters);
  }

  /**
   * Provides a way to subscribe to filter changes.
   */
  onChanged(): Observable<FilterSettings> {
    return this.filters$.asObservable();
  }

  /**
   * Saves the given filters to localStorage and
   * triggers a 'onChanged' event for all
   * subscribers of this FilterService.
   */
  persistFilters(newFilters?: FilterSettings): void {

    this.filters = newFilters || this.defaults;
    localStorage.setItem('filters', JSON.stringify(this.filters));

    this.filters$.next(this.filters);
  }

    /**
     * Returns the default settings.
     */
  private get defaults(): FilterSettings {
    return {
      showGyms: true,
      badges: [],
      includeLegacy: true,
    };
  }
}
