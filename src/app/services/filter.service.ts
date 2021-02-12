import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { FilterSettings, FilterObject } from '../model/shared.model';
import { GymFilter } from '../model/gym.model';

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
  private filters$: BehaviorSubject<FilterObject>;

  constructor() {

    const f = localStorage.getItem('filters');

    this.filters = f ? JSON.parse(f) as FilterSettings : this.defaults;
    this.filters$ = new BehaviorSubject(this.update());
  }

  /**
   * Provides a way to subscribe to filter changes.
   */
  onChanged(): Observable<FilterObject> {
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

    this.filters$.next(this.update());
  }

  /**
   * Updates the filter object and returns it.
   */
  private update(): FilterObject {
    return {
      showGyms: this.filters.showGyms,
      gyms: this.createGymFilter(this.filters),
    };
  }

    /**
     * Returns the default settings.
     */
  private get defaults(): FilterSettings {
    return {
      showGyms: true,
      badges: [],
      negateBadge: false,
      includeLegacy: true,
    };
  }

  /**
   * Creates the Filter for the gym layer as
   * needed by the mapboxgl api.
   */
  private createGymFilter(data: GymFilter): any[] | undefined {

    const filter = [];

    if (data.badges.length) {
      filter.push([ 'match', ['get', 'badge'], data.badges ]);
    }

    if (!data.includeLegacy) {
      filter.push(['!', ['has', 'isLegacy']]);
    }

    return filter.length > 1 ? ['all', ...filter] : (filter.length === 1 ? filter.flat() : undefined);
  }
}
