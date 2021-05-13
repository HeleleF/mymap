import { AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { getKeys } from '../shared/utils';
import { GymBadge } from '../model/gym.model';

import { AppInjector } from '../shared/app-injector';

export class ValidatorService {
	constructor() {}

	static validPortalId(control: AbstractControl): ValidationErrors | null {
		return /^[0-9a-f]{32}(\.(1[126]|2))?$/.test(control.value)
			? null
			: { wrongFormat: { value: control.value as string } };
	}

	// from https://stackoverflow.com/a/31408260
	static validLatitude(control: AbstractControl): ValidationErrors | null {
		return /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/.test(
			control.value
		)
			? null
			: { malformedPos: { value: control.value as string } };
	}
	static validLongitude(control: AbstractControl): ValidationErrors | null {
		return /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/.test(
			control.value
		)
			? null
			: { malformedPos: { value: control.value as string } };
	}

	static validPosition(control: AbstractControl): ValidationErrors | null {
		// TODO(helene): deprecate this in favor of lat and long validator
		return /^\d+\.\d+,\d+\.\d+$/.test(control.value)
			? null
			: { malformedPos: { value: control.value as string } };
	}

	static validBadge(control: AbstractControl): ValidationErrors | null {
		const validBadges = getKeys(GymBadge);
		return validBadges.includes(control.value)
			? null
			: { wrongBadge: { value: control.value as string } };
	}

	static validGymUrl(
		control: AbstractControl
	): Observable<ValidationErrors | null> {
		const uri: string = (control.value as string).replace(
			/^https?:\/\//,
			''
		);

		return AppInjector.get(HttpClient)
			.get(`https://${uri}`, { responseType: 'blob' })
			.pipe(
				map((blob) => {
					return blob.type.includes('image') && blob.size > 0
						? null
						: { noImage: { value: control.value as string } };
				}),
				catchError(() => {
					return of({ noUrl: { value: control.value as string } });
				})
			);
	}

	/**
	 * Tries to extract the necessary gym information from a given string
	 * and returns it as a form group structure.
	 */
	static parseAndValidate(text: string): { [key: string]: unknown } {
		// eslint-disable-next-line max-len
		const matcher =
			/badge: (?<badge>\d)\s{1,2}description: "(?<name>.*)"\s{1,2}gym_id: "(?<id>.*)"\s{1,2}location: "(?<pos>.*)"\s{1,2}url: "(?<url>.*)"/m;

		const match = matcher.exec(text); // || { groups: { name: null, url: null, pos: null, id: null, badge: null } };

		if (!match || !match.groups) {
			return { name: null, url: null, pos: null, id: null, badge: null };
		}

		const { groups } = match;

		if (groups.badge) groups.badge = GymBadge[+groups.badge];
		return groups;
	}
}
