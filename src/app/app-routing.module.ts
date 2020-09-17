import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapComponent } from './map/map.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { AuthGuard } from './guards/auth.guard';

import { Role } from './model/role.model';
import { BadgeListComponent } from './badge-list/badge-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'badges', component: BadgeListComponent, canActivate: [AuthGuard], data: { roles: [ Role.ADMIN, Role.SUBSCRIBER ] } },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { roles: [ Role.ADMIN, Role.SUBSCRIBER ] } },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard], data: { roles: [ Role.ADMIN, Role.SUBSCRIBER ] } },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
