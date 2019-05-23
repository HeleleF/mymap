import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private API_URL: string;

  constructor(private httpClient: HttpClient) {
    this.API_URL = 'http://localhost:8011';
   }

  getStops() {
    return this.httpClient.get<ApiModel.StopInfo[]>(`${this.API_URL}/stops/`)
    .pipe(catchError(this.handleError));
  };

  getGyms() {
    return this.httpClient.get<ApiModel.GymInfo[]>(`${this.API_URL}/gyms/`)
    .pipe(catchError(this.handleError));
  }

  setGymBadge(data: ApiModel.GymBadgeInfo) {
    return this.httpClient.put(`${this.API_URL}/gyms/badge`, {
      badge: data
    })
    .pipe(catchError(this.handleError));
  }

  setMultipleGymBadges(data: ApiModel.GymBadgeInfo[]) {
    return this.httpClient.post(`${this.API_URL}/gyms/badges`, {
      badges: data
    })
    .pipe(catchError(this.handleError));
  }

  getBadgesCount() {
    return this.httpClient.get(`${this.API_URL}/gyms/count`)
    .pipe(catchError(this.handleError));
  }

  /**
   * Creates a stop and returns the stop info
   */
  addNewStop(pos: ApiModel.StopInfo) {
    return this.httpClient.post<ApiModel.StopInfo>(`${this.API_URL}/stops/new`, {
      stop: pos
    })
    .pipe(catchError(this.handleError));
  }

  /**
   * Creates a gym and returns the gym info
   */
  addNewGym(pos: ApiModel.GymInfo) {
    return this.httpClient.post<ApiModel.GymInfo>(`${this.API_URL}/gyms/new`, {
      gym: pos
    })
    .pipe(catchError(this.handleError));
  }

  /**
   * Updates the stop with the given info and returns the stop info
   */
  updateStop(stop: Partial<ApiModel.StopInfo>) {
    return this.httpClient.put<ApiModel.StopInfo>(`${this.API_URL}/stops/update`, {

    })
    .pipe(catchError(this.handleError));
  }

  /**
   * Updates the gym with the given info and returns the gym info
   */
  updateGym(gym: Partial<ApiModel.GymInfo>) {
    return this.httpClient.put<ApiModel.GymInfo>(`${this.API_URL}/gyms/update`, {

    })
    .pipe(catchError(this.handleError));
  }

  /**
   * Deletes the stop with the given id and returns the stop info
   */
  removeStop(stopId: string) {
    return this.httpClient.delete<ApiModel.StopInfo>(`${this.API_URL}/stops/${stopId}`)
    .pipe(catchError(this.handleError));
  }

  /**
   * Deletes the gym with the given id and returns the gym info
   */
  removeGym(gymId: string) {
    return this.httpClient.delete<ApiModel.GymInfo>(`${this.API_URL}/gyms/${gymId}`)
    .pipe(catchError(this.handleError));
  }

  /**
   * Turns the stop with given id into a gym and returns the gym info
   */
  turnStopIntoGym(stopId: string) {
    return this.httpClient.put<ApiModel.GymInfo>(`${this.API_URL}/stops/promote`, {
      id: stopId
    })
    .pipe(catchError(this.handleError));
  }

  /**
   * Turns the gym with given id into a stop and returns the stop info
   */
  turnGymIntoStop(gymId: string) {
    return this.httpClient.put<ApiModel.StopInfo>(`${this.API_URL}/gyms/demote`, {
      id: gymId
    })
    .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {

    if (error.error instanceof ErrorEvent) {

      console.error('client or network error:', error.error.message);

    } else {

      console.error(`Backend error: ${error.status}`);

    }
    return throwError('Something bad happened; please try again later.');
  };
}
