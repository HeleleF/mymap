import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ServiceWorkerModule } from '@angular/service-worker';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { AngularFireModule } from '@angular/fire';
import {
	AngularFirestoreModule,
	SETTINGS as FIRESTORE_SETTINGS
} from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { ToastrModule } from 'ngx-toastr';
import { UiScrollModule } from 'ngx-ui-scroll';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ImgFallbackDirective } from './directives/img-fallback.directive';

import { AutochipsComponent } from './autochips/autochips.component';
import { BadgeListComponent } from './badge-list/badge-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FilterComponent } from './filter/filter.component';
import { GymPopupComponent } from './gym-popup/gym-popup.component';
import { LockedComponent } from './locked/locked.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { NewGymComponent } from './new-gym/new-gym.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SettingsComponent } from './settings/settings.component';

import { setAppInjector } from './shared/app-injector';

@NgModule({
	declarations: [
		AppComponent,
		MapComponent,
		GymPopupComponent,
		LoginComponent,
		ImgFallbackDirective,
		DashboardComponent,
		FilterComponent,
		AutochipsComponent,
		SettingsComponent,
		NewGymComponent,
		PageNotFoundComponent,
		LockedComponent,
		BadgeListComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot({
			positionClass: 'toast-bottom-right'
		}),
		UiScrollModule,
		FormsModule,
		ReactiveFormsModule,
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production
		}),
		MatToolbarModule,
		MatMenuModule,
		MatIconModule,
		MatCardModule,
		MatButtonModule,
		MatTabsModule,
		MatChipsModule,
		MatDialogModule,
		MatListModule,
		MatFormFieldModule,
		MatRadioModule,
		MatCheckboxModule,
		MatAutocompleteModule,
		MatDividerModule,
		MatInputModule,
		MatProgressBarModule,
		MatProgressSpinnerModule,
		MatRippleModule,
		MatSelectModule,
		AngularFireModule.initializeApp(environment.firebaseConfig),
		AngularFirestoreModule.enablePersistence(),
		AngularFireAuthModule,
		HttpClientModule
	],
	providers: [
		{
			provide: FIRESTORE_SETTINGS,
			useValue: environment.production
				? undefined
				: {
						host: 'localhost:8080',
						ssl: false
				  }
		}
	],

	bootstrap: [AppComponent]
})
export class AppModule {
	// store the Injector for later use in other components
	constructor(inj: Injector) {
		setAppInjector(inj);
	}
}
