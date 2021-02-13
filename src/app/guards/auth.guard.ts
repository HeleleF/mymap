import { Injectable } from '@angular/core';
import {
	CanActivate,
	Router,
	UrlTree,
	ActivatedRouteSnapshot
} from '@angular/router';

import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { UserService } from '../services/user.service';
import { Role } from '../model/role.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot): Observable<UrlTree | boolean> {
		return this.userService.getCurrentUser().pipe(
			take(1),
			map((user) => {
				if (user) {
					if (route.data.roles) {
						if ((route.data.roles as Role[]).includes(user.role)) {
							return true;
						} else {
							return this.router.parseUrl('/dashboard');
						}
					} else {
						return true;
					}
				} else {
					return this.router.parseUrl('/login');
				}
			})
		);
	}
}
