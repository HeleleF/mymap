import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

import { Observable, of, from, zip } from 'rxjs';
import { map, switchMap, mergeMap, tap } from 'rxjs/operators';

import { firestore } from 'firebase';

import { User, Medal } from '../model/shared.model';
import { Role } from '../model/role.model';
import { BadgeCollection} from '../model/gym.model';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUID = '';

  private opts: firestore.GetOptions;

  private mUser$: Observable<User | null>;
  private userCollection: AngularFirestoreCollection<User>;

  constructor(
    private store: AngularFirestore,
    private auth: AuthService
  ) {

    const useCache = Boolean(localStorage.getItem('medalCache'));
    this.opts = useCache ? { source: 'cache' } : {};

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
            mergeMap(snap => {

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
        return of(null);   })
    );

   }

  getCurrentUser(): Observable<User | null> {
    return this.mUser$;
  }

  getMedals(): Observable<BadgeCollection> {
    return this.store.collection<Medal>(`/users/${this.currentUID}/medals`).get(this.opts).pipe(
      tap(this.setCached.bind(this)),
      map(({ docs }) => {

        return docs.reduce((acc, cur) => {

          acc[cur.id] = (cur.data() as Medal).badge;
          return acc;

        }, {} as BadgeCollection);

      })
    );

  }

  getMedalCounts(): Observable<number[]> {
    return this.store.collection<Medal>(`/users/${this.currentUID}/medals`).get(this.opts).pipe(
      tap(this.setCached),
      map(({ docs }) => {

        const badgeTypeCounts = [0, 0, 0, 0];

        return docs.reduce((acc, cur) => {

          const badgeValue = cur.data().badge - 1;
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          acc[badgeValue] ? acc[badgeValue]++ : acc[badgeValue] = 1;

          return acc;

        }, badgeTypeCounts);

      })
    );

  }

  getUserInfo(): Observable<{ badges: number[], user: User | null }> {

    return zip(this.getMedalCounts(), this.getCurrentUser()).pipe(
      map(([mc, u]) => {
          return { badges: mc, user: u };
      })
    );
  }

  setBadge(firestoreId: string, newBadge: number): Promise<void> {
    const medalRef = this.store.doc(`users/${this.currentUID}/medals/${firestoreId}`);
    return medalRef.set({ badge: newBadge });
  }

  getAllUsers(): Observable<firestore.QuerySnapshot<firestore.DocumentData>> {
    return this.userCollection.get(this.opts);
  }

  private setCached() {
    if (!localStorage.getItem('medalCache')) {
      this.opts = { source: 'cache' };
      localStorage.setItem('medalCache', 'true');
    }
  }
}
