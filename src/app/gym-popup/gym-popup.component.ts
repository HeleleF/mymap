/* eslint-disable @typescript-eslint/unbound-method */
import { Component, Inject } from '@angular/core';
import {
	FormGroup,
	FormBuilder,
	Validators,
	AbstractControl
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FilterService } from '../services/filter.service';
import { ValidatorService } from '../services/validator.service';

import { getKeys, roundToSixDecimals } from '../shared/utils';

import { CustomError, PopupReturn } from '../model/shared.model';
import { GymProps, GymBadge, UpdateGymData } from '../model/gym.model';
import { GymService } from '../services/gym.service';
import { UserService } from '../services/user.service';

@Component({
	selector: 'app-gym-popup',
	templateUrl: './gym-popup.component.html',
	styleUrls: ['./gym-popup.component.scss']
})
export class GymPopupComponent {
	oldBadge: number;
	readonly last: number;
	isGymEdit = false;

	gymUpdate: FormGroup;

	constructor(
		public popup: MatDialogRef<GymPopupComponent, PopupReturn>,
		@Inject(MAT_DIALOG_DATA)
		public gymData: GymProps & { position: number[]; badge: number },
		private db: GymService,
		private us: UserService,
		private fs: FilterService,
		private fb: FormBuilder
	) {
		this.oldBadge = this.gymData.badge;

		this.last = getKeys(GymBadge).length - 1;

		this.gymUpdate = this.fb.group(
			{
				name: ['', [Validators.required]],
				lat: [
					'',
					[Validators.required, ValidatorService.validLatitude]
				],
				lng: [
					'',
					[Validators.required, ValidatorService.validLongitude]
				],
				isLegacy: [''],
				imageUrl: [
					'',
					[Validators.required],
					[ValidatorService.validGymUrl]
				]
			},
			{ updateOn: 'blur' }
		);
	}

	/**
	 * For convenience in the html template
	 */
	get f(): { [key: string]: AbstractControl } {
		return this.gymUpdate.controls;
	}

	upgrade(): void {
		if (this.gymData.badge < this.last) this.gymData.badge++;
	}

	downgrade(): void {
		if (this.gymData.badge > 0) this.gymData.badge--;
	}

	setBadge(): void {
		this.us
			.setBadge(this.gymData.firestoreId, this.gymData.badge)
			.then(() => {
				this.popup.close({
					type: 'badgeUpdate',
					data: {
						firestoreId: this.gymData.firestoreId,
						newBadge: this.gymData.badge
					}
				});
			})
			.catch((err: CustomError) => {
				this.popup.close({
					type: 'badgeUpdateFailed',
					data: err.message
				});
			});
	}

	toggleEditGym(): void {
		this.gymUpdate.reset({
			name: this.gymData.name,
			lat: roundToSixDecimals(this.gymData.position[1]),
			lng: roundToSixDecimals(this.gymData.position[0]),
			imageUrl: this.gymData.imageUrl,
			isLegacy: !!this.gymData.isLegacy
		});
		this.isGymEdit = !this.isGymEdit;
	}

	async saveGymEdit(): Promise<void> {
		const payload = Object.keys(this.gymUpdate.controls).reduce(
			(acc, cur) => {
				const k = this.gymUpdate.controls[cur];

				if (k.dirty) {
					acc[cur] = k.value as string;
				}
				return acc;
			},
			{} as UpdateGymData
		);

		if (!Object.keys(payload).length) return;

		this.gymUpdate.disable();

		// since position is stored as Geopoint, even if only latitude is changed, we also need longitude (and vice versa)
		if (payload.lat && !payload.lng) {
			payload.lng = (this.gymUpdate.value as UpdateGymData).lng;
		} else if (payload.lng && !payload.lat) {
			payload.lat = (this.gymUpdate.value as UpdateGymData).lat;
		}

		// we need the id to identify (hehe) the corresponding document
		payload.firestoreId = this.gymData.firestoreId;

		try {
			await this.db.update(payload);
			this.popup.close({ type: 'gymUpdate', data: payload });
		} catch (err) {
			this.popup.close({
				type: 'gymUpdateFailed',
				data: (err as CustomError).message
			});
		}
	}
}
