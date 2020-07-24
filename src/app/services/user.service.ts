import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

import { User, Medal } from '../model/shared.model';
import { Observable, of, from, zip } from 'rxjs';
import { map, switchMap, flatMap, tap } from 'rxjs/operators';
import { Role } from '../model/role.model';
import { BadgeCollection} from '../model/gym.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private mUser$: Observable<User | null>;
  private userCollection: AngularFirestoreCollection<User>;
  currentUID: string | undefined;

  constructor(
    private store: AngularFirestore,
    private auth: AuthService
  ) {

    this.userCollection = this.store.collection<User>('users');

    this.mUser$ = this.auth.user$.pipe(

      tap(maybeUser => {
        if (maybeUser) {
          this.currentUID = maybeUser.uid;
        }
      }),

      switchMap(user => {

        if (user) {

          const userRef = this.store.doc<User>(`users/${user.uid}`);

          return userRef.get().pipe(
            flatMap(snap => {

              if (snap.exists) {
                return of(snap.data() as User);
              }

              const userData: User = {
                uid: user.uid,
                name: user.displayName,
                image: user.photoURL,
                role: Role.USER
              };

              return from(userRef.set(userData)).pipe(
                map(() => userData)
              );
            })
          );

        }
        return of(null);     
      })
    );

   }

  getCurrentUser() {
    return this.mUser$;
  }

  getMedals() {
    return this.store.collection<Medal>(`/users/${this.currentUID}/medals`).get().pipe(
      map(({ docs }) => {

        return docs.reduce((acc, cur) => {

          acc[cur.id] = cur.data().badge;
          return acc;

        }, {} as BadgeCollection);

      })
    );

  }

  getMedalCounts() {
    return this.store.collection<Medal>(`/users/${this.currentUID}/medals`).get().pipe(
      map(({ docs }) => {

        const badgeTypeCounts = [0, 0, 0, 0];

        return docs.reduce((acc, cur) => {

          const badgeValue = cur.data().badge - 1;
          acc[badgeValue] ? acc[badgeValue]++ : acc[badgeValue] = 1;

          return acc;

        }, badgeTypeCounts);

      })
    );

  }

  getUserInfo() {

    return zip(this.getMedalCounts(), this.getCurrentUser()).pipe(
      map(([mc, u]) => {
          return { badges: mc, user: u };
      })
    );
  }

  setBadge(firestoreId: string, newBadge: number) {
    const medalRef = this.store.doc(`users/${this.currentUID}/medals/${firestoreId}`);
    return medalRef.set({ badge: newBadge });
  }


  getAllUsers() {
    return this.userCollection.get();
  }
}
