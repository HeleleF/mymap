import { ValidatorFn, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { getKeys } from '../shared/utils';
import { GymBadge } from '../model/gym.model';

@Injectable({
    providedIn: 'root'
})
export class ValidatorService {

    constructor(private http: HttpClient) {}

    createGymIdValidator(): ValidatorFn {

        const guid = /^[0-9a-f]{32}(\.(1[126]|2))?$/;

        return (control: AbstractControl): { [key: string]: any } | null => {
            return guid.test(control.value) ? null : { wrongFormat: { value: control.value } };
        };
    }

    createGymPositionValidator(): ValidatorFn {

        const latlng = /^\d{2}\.\d+\,\d{2}\.\d+$/;

        return (control: AbstractControl): { [key: string]: any } | null => {
            return latlng.test(control.value) ? null : { malformedPos: { value: control.value } };
        };
    }

    createGymBadgeValidator(): ValidatorFn {

        const validBadges = getKeys(GymBadge);

        return (control: AbstractControl): { [key: string]: any } | null => {
            return validBadges.includes(control.value) ? null : { wrongBadge: { value: control.value } };
        };
    }

    createGymUrlValidator(): AsyncValidatorFn {

        return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

            return this.http.get(control.value, { responseType: 'blob' }).pipe(
                map((blob) => {
                    return blob.type.includes('image') && blob.size > 0 ? null : { noImage: { value: control.value } };
                }),
                catchError(() => {
                    return of({ noUrl: { value: control.value } });
                })
            );
        };
    }

    /**
     * Tries to extract the necessary gym information from a given string
     * and returns it as a form group structure.
     */
    parseAndValidate(text: string): {[key: string]: any} {

        const matcher = /description: \"(?<name>.*)\"\s{1,2}url: \"(?<url>.*)\"\s{1,2}location: \"(?<pos>.*)\"\s{1,2}gym_id: \"(?<id>.*)\"\s{1,2}badge: (?<badge>\d)/m;

        const match = matcher.exec(text); // || { groups: { name: null, url: null, pos: null, id: null, badge: null } };

        if (!match || !match.groups) {
            return { name: null, url: null, pos: null, id: null, badge: null };
        }

        const { groups } = match;

        if (groups.badge) groups.badge = GymBadge[+groups.badge];
        return groups;
    }
}

