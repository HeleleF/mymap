import { Injectable } from '@angular/core';

import { Resolve, Router } from '@angular/router';

import { AuthService } from '../shared/auth.service';

@Injectable({
    providedIn: 'root'
})
export class MapResolver implements Resolve<boolean> {

    constructor(private auth: AuthService,
                private router: Router
    ) { }

    async resolve() {

        const currentUser = await this.auth.getCurrentUser();

        // if null, user is not logged in
        if (currentUser) {

            return true;

        } else {
            this.router.navigate(['/login']);
            return false;
        }

    }
}
