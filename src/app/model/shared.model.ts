import { Role } from './role.model';

export interface Poke {
	dex: string;
	name: string;
}

export interface Message {
	type: 'newGym' | 'settings';
	data: unknown;
}

export interface ErrorMessage {
	type: 'Gym';
	err: string;
	data?: unknown;
}

export enum MapStyle {
	Light = 'light-v10',
	Dark = 'dark-v10',
	Outdoors = 'outdoors-v11',
	Streets = 'streets-v11'
}

export interface FilterSettings {
	showGyms: boolean;

	negateBadge?: boolean;
	badges: number[];

	includeLegacy: boolean;
}

export interface User {
	uid: string;
	image: string | null;
	name: string | null;
	role: Role;

	// mehr wenn wir brauchen
}

export interface Medal {
	badge: number;
}

export interface PopupReturn {
	type:
		| 'badgeUpdateFailed'
		| 'badgeUpdate'
		| 'questUpdate'
		| 'gymUpdateFailed'
		| 'gymUpdate';
	data: unknown;
}

export interface CustomError {
	err: string;
	type: string;
	message: string;
	code: string;
}

export interface FilterError {
	err: string;
	type: string;
	message: string;
	code: string;
}
