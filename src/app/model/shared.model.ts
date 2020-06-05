export interface Poke {
    dex: string;
    name: string;
}

export interface Message {
    type: 'newGym' | 'settings' | 'selectGym';
    data: any;
}

export interface ErrorMessage {
    type: 'Gym';
    err: string;
    data?: any;
}

export interface FilterObject {
    showGyms: boolean;
    showQuests: boolean;
    quests?: any[];
    gyms?: any[];
}

export enum MapStyle {
    Light = 'light-v10',
    Dark = 'dark-v10',
    Outdoors = 'outdoors-v11',
    Streets = 'streets-v11',
}

export interface FilterSettings {

  showQuests: boolean;
  showGyms: boolean;

  hasEncounter?: boolean;
  negateEncounter?: boolean;
  encounters: any;

  rewards: any;
  hasReward?: boolean;
  negateReward?: boolean;

  negateType?: boolean;
  types: any;

  negateBadge?: boolean;
  badges: number[];

  includeLegacy: boolean;
}

export interface User {
    uid: string;
    photoURL?: string;
    displayName?: string;
    isAdmin?: boolean;

    // mehr wenn wir brauchen
}

export interface PopupReturn {
    type: 'badgeUpdateFailed' | 'badgeUpdate' | 'questUpdate' | 'gymUpdateFailed' | 'gymUpdate';
    data: any;
}
