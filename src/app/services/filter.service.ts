import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { FilterSettings, FilterObject } from '../model/shared.model';
import { GymFilter } from '../model/gym.model';
import { QuestFilter, QuestType, QuestReward } from '../model/quest.model';

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

    this.filters = f ? JSON.parse(f) : this.getDefaults();
    this.filters$ = new BehaviorSubject(this.update());
  }

  /**
   * Returns the default settings.
   */
  private getDefaults(): FilterSettings {
    return {
      showGyms: true,
      showQuests: true,
      encounters: [],
      rewards: [],
      types: [],
      badges: [],
      negateBadge: false,
      negateEncounter: false,
      hasEncounter: false,
      hasReward: false,
      negateReward: false,
      negateType: false
    };
  }

  /**
   * Creates the Filter for the gym layer as
   * needed by the mapboxgl api.
   */
  private createGymFilter(data: GymFilter): any[] | undefined {

    const filter = [];
    const badges = [];

    if (data.badges.length) {

      badges.push('match', ['get', 'badge'], data.badges);
      data.negateBadge ? badges.push(false, true) : badges.push(true, false);

      filter.push(badges);

    }

    return filter.length > 1 ? ['all', ...filter] : (filter.length === 1 ? filter.flat() : undefined);
  }

  /**
   * Creates the Filter for the quest layer as
   * needed by the mapboxgl api.
   */
  private createQuestFilter(data: QuestFilter): any[] | undefined {

    const filter = [];
    const types = [];
    const rewards = [];
    const encounters = [];

    if (data.types.length) {
      types.push('match', ['get', 'type'], data.types);
      data.negateType ? types.push(false, true) : types.push(true, false);

      filter.push(types);
    }

    if (data.rewards.length) {
      rewards.push('match', ['get', 'reward'], data.rewards);
      data.negateReward ? rewards.push(false, true) : rewards.push(true, false);

      filter.push(rewards);
    }

    if (!rewards.length && data.hasReward) {
      rewards.push('has', 'quantity');

      filter.push(rewards);
    }

    if (data.encounters.length) {
      encounters.push('match', ['get', 'encounter'], data.encounters);
      data.negateEncounter ? encounters.push(false, true) : encounters.push(true, false);

      filter.push(encounters);
    }

    if (!encounters.length && data.hasEncounter) {
      encounters.push('has', 'encounter');

      filter.push(encounters);
    }

    return filter.length > 1 ? ['all', ...filter] : (filter.length === 1 ? filter.flat() : undefined);
  }

  excludeOneType(type: QuestType) {

  }

  excludeOneReward(reward: string) {

  }

  /**
   * Updates the filter object and returns it.
   */
  private update(): FilterObject {
    return {
      showGyms: this.filters.showGyms,
      showQuests: this.filters.showQuests,
      gyms: this.createGymFilter(this.filters),
      quests: this.createQuestFilter(this.filters),
    };
  }

  /**
   * Provides a way to subscribe to filter changes.
   */
  onChanged() {
    return this.filters$.asObservable();
  }

  /**
   * Saves the given filters to localStorage and
   * triggers a 'onChanged' event for all
   * subscribers of this FilterService.
   */
  persistFilters(newFilters?: FilterSettings) {

    console.debug('Filter Service recieved ', newFilters);

    this.filters = newFilters || this.getDefaults();
    localStorage.setItem('filters', JSON.stringify(this.filters));

    this.filters$.next(this.update());
  }
}
