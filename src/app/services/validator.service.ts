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
        return /^[0-9a-f]{32}(\.(1[126]|2))?$/.test(control.value) ? null : { wrongFormat: { value: control.value } };
    }

    static validPosition(control: AbstractControl): ValidationErrors | null {
        return /^\d{2}\.\d+\,\d{2}\.\d+$/.test(control.value) ? null : { malformedPos: { value: control.value } };
    }

    static validBadge(control: AbstractControl): ValidationErrors | null {
        const validBadges = getKeys(GymBadge);
        return validBadges.includes(control.value) ? null : { wrongBadge: { value: control.value } };
    }

    static validGymUrl(control: AbstractControl): Observable<ValidationErrors | null> {

        const uri = control.value.replace(/^https?\:\/\//, '');

        return AppInjector.get(HttpClient).get(`https://${uri}`, { responseType: 'blob' }).pipe(
            map((blob) => {
                return blob.type.includes('image') && blob.size > 0 ? null : { noImage: { value: control.value } };
            }),
            catchError(() => {
                return of({ noUrl: { value: control.value } });
            })
        );
    }

    /**
     * Tries to extract the necessary gym information from a given string
     * and returns it as a form group structure.
     */
    static parseAndValidate(text: string): {[key: string]: any} {

        const matcher = /badge: (?<badge>\d)\s{1,2}description: \"(?<name>.*)\"\s{1,2}gym_id: \"(?<id>.*)\"\s{1,2}location: \"(?<pos>.*)\"\s{1,2}url: \"(?<url>.*)\"/m;

        const match = matcher.exec(text); // || { groups: { name: null, url: null, pos: null, id: null, badge: null } };

        if (!match || !match.groups) {
            return { name: null, url: null, pos: null, id: null, badge: null };
        }

        const { groups } = match;

        if (groups.badge) groups.badge = GymBadge[+groups.badge];
        return groups;
    }
}

