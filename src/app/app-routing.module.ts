import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapComponent } from './map/map.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './shared/auth.guard';
import { MapResolver } from './map/map.resolver';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, resolve: [MapResolver] },
  { path: 'settings', component: SettingsComponent, resolve: [MapResolver] },
  { path: 'map', component: MapComponent, resolve: [MapResolver] }
  //TODO: wenns nich gibt, auch login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
