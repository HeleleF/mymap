import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { DbService } from './db.service';
import { GymFilter, QuestFilter, QuestReward, QuestType, FilterSettings, FilterObject, GymInfo, Message } from '../model/api.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private message$: BehaviorSubject<Message>;
  public filters: FilterSettings;

  constructor(private db: DbService) {
    this.filters = JSON.parse(localStorage.getItem('filters')) || this.getDefaults();
    this.message$ = new BehaviorSubject(this.update());
  }

  onMessage() {
    return this.message$.asObservable();
  }

  getOnce() {
    return this.filters;
  }

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

  private createGymFilter(data: GymFilter) {

    const filter = [];
    const badges = [];

    if (data.badges.length) {

      badges.push('match', ['get', 'badge'], data.badges);
      data.negateBadge ? badges.push(false, true) : badges.push(true, false);

      filter.push(badges);

    }

    return filter.length > 1 ? ['all', ...filter] : (filter.length === 1 ? filter.flat() : null);
  }

  private createQuestFilter(data: QuestFilter) {

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

    return filter.length > 1 ? ['all', ...filter] : (filter.length === 1 ? filter.flat() : null);
  }

  excludeOneType(type: QuestType) {

  }

  excludeOneReward(reward: QuestReward) {

  }

  private update(): Message {

    const filterObj: FilterObject = {
      showGyms: this.filters.showGyms,
      showQuests: this.filters.showQuests
    };

    filterObj.gyms = this.createGymFilter(this.filters);
    filterObj.quests = this.createQuestFilter(this.filters);

    return {
      type: 'filtersChanged',
      data: filterObj
    };
  }

  persistFilters(data?: FilterSettings) {

    console.log('Filter Service recieved ', data);

    this.filters = data || this.getDefaults();
    localStorage.setItem('filters', JSON.stringify(this.filters));

    return this.message$.next(this.update());
  }

  async addGym(gymData: GymInfo) {

    try {
      const res = await this.db.addGym(gymData);

      this.message$.next({
        type: 'newGym',
        data: res
      });

    } catch (e) {
      this.message$.error({
        type: 'Gym',
        msg: `Couldn't add ${gymData.d} because: ${e.message}`
      });
    }
  }
}
