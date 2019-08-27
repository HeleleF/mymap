import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { MapComponent } from './map/map.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';

import { PopupComponent } from './popup/popup.component';
import { LoginComponent } from './login/login.component';
import { ImgFallbackDirective } from './directives/img-fallback.directive';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FilterComponent } from './filter/filter.component';
import { AutochipsComponent } from './autochips/autochips.component';
import { SettingsComponent } from './settings/settings.component';

import { setAppInjector } from './shared/appInjector';
import { NewGymComponent } from './new-gym/new-gym.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    PopupComponent,
    LoginComponent,
    ImgFallbackDirective,
    DashboardComponent,
    FilterComponent,
    AutochipsComponent,
    SettingsComponent,
    NewGymComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    }),
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatFormFieldModule,
    MatRadioModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatInputModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    HttpClientModule
  ],
  entryComponents: [PopupComponent, FilterComponent, NewGymComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 

  // store the Injector for later use in other components
  constructor(private inj: Injector) {
    setAppInjector(inj);
  }
}
