import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';

import { from, of, throwError } from 'rxjs';
import { map, flatMap, tap, catchError } from 'rxjs/operators';

import { GeoHash, createRows } from '../shared/utils';

import { GymInfo, BadgeEntry, GymProps } from '../model/gym.model';
import { QuestInfo, QuestStatus, QuestProps } from '../model/quest.model';

/**
 * A service to query the firestore database.
 */
@Injectable({
  providedIn: 'root'
})
export class DbService {

  private gymsRef: AngularFirestoreCollection<GymInfo>;
  private questsRef: AngularFirestoreCollection<QuestInfo>;

  gymsCached: boolean;
  questsCached: boolean;
  private expire: number;

  constructor(private store: AngularFirestore) {

    this.gymsRef = this.store.collection<GymInfo>('gyms'); // , ref => ref.limit(150));
    this.questsRef = this.store.collection<QuestInfo>('quests', ref => ref.limit(150));

    this.gymsCached = JSON.parse(localStorage.getItem('gymsCached') || '0');
    this.questsCached = JSON.parse(localStorage.getItem('questsCached') || '0');
    this.expire = Number(localStorage.getItem('questsExpire'));
  }

  /**
   * Returns all gyms from firestore as GeoJSON FeatureCollection.
   * 
   * Uses the cache if possible.
   */
  getGyms() {

    // return throwError(new Error('Gyms sind nicht da!'));

    const opts: firestore.GetOptions = this.gymsCached ? { source: 'cache' } : {};

    return this.gymsRef.get(opts).pipe(
      tap(() => {
        if (!this.gymsCached) {
          this.gymsCached = true;
          localStorage.setItem('gymsCached', 'true');
        }
      }),
      map(({ docs }) => {

        const features = (docs as QueryDocumentSnapshot<GymInfo>[]).map(doc => {

          const p = doc.data();

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [p.lon, p.lat]
            },
            properties: {
              firestore_id: doc.id,
              portal_id: p.i,
              image_url: p.u,
              name: p.d,
              badge: p.b
            }
          };
        });

        return {
          type: 'FeatureCollection',
          features
        } as GeoJSON.FeatureCollection<GeoJSON.Point, GymProps>;

      })
    );
  }

  /**
   * Adds a new gym to firestore and returns
   * its data as GeoJSON
   */
  addGym(p: GymInfo) {

    const sameGyms = this.store.collection<GymInfo>('gyms', ref => ref.where('i', '==', p.i));

    // query for gyms with this gym id
    return sameGyms.get().pipe(

      flatMap((snap) => {

        // at least one other gym with this id already exists, return error
        if (snap.size) {
          return of(null);
        }

        // gym id is not used yet, add the gym
        return from(this.gymsRef.add(p)).pipe(

          map((newGymRef) => {

            return ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [p.lon, p.lat]
              },
              properties: {
                firestore_id: newGymRef.id,
                portal_id: p.i,
                image_url: p.u,
                name: p.d,
                badge: p.b
              }
            }) as GeoJSON.Feature<GeoJSON.Point, GymProps>;

          })

        );
      })
    );
  }

  /**
   * Updates the badge of an existing gym.
   */
  setGymBadge({ firestore_id, badge }: GymProps) {

    const gym = this.gymsRef.doc<GymInfo>(firestore_id);
    return gym.update({ b: badge });
  }

  updateGym({firestore_id, name, image_url, pos }: GymProps & { pos: number[] }) {

    const [ lon, lat ] = pos;

    const gym = this.gymsRef.doc<GymInfo>(firestore_id);
    return gym.update({ d: name, u: image_url, lat, lon });
  }

  /**
   * Returns an object that contains the counts of each badge type and an array containing
   * all gyms as rows of three each.
   * 
   * Always uses the cache!
   */
  getAllBadgeEntries() {

    const col = this.store.collection<GymInfo>('gyms', ref => ref.where('b', '>', 0).orderBy('b', 'desc').orderBy('d', 'asc'));

    return col.get({ source: 'cache' }).pipe(
      map(({ docs }) => {

        const badgeTypeCounts = [0, 0, 0, 0];

        const badgeEntries = (docs as QueryDocumentSnapshot<GymInfo>[]).map(s => {
          const { u, d, b } = s.data();
          badgeTypeCounts[b - 1]++;
          return { u, d, b } as BadgeEntry;
        });
        return { badgeTypeCounts, badgeRows: createRows(badgeEntries) };
      })
    );
  }

  /**
   * Returns all quests from firestore as GeoJSON FeatureCollection.
   * 
   * Uses the cache if possible.
   */
  getQuests() {

    // quests in cache are from the previous day, request new ones from server
    /*
    if (this.questsCached && (this.expire < Date.now())) {
      console.debug('expired');
      this.questsCached = false;
    }
    */

    // return throwError(new Error('Quests sind nicht da!'));

    const opts: firestore.GetOptions = this.questsCached ? { source: 'cache' } : {};

    return this.questsRef.get(opts).pipe(
      tap(() => {

        // quests are now cached until the next day at 6am
        if (!this.questsCached) {
          this.questsCached = true;
          localStorage.setItem('questsCached', 'true');

          this.expire = new Date().setHours(30, 0, 0, 0);
          localStorage.setItem('questsExpire', `${this.expire}`);
        }
      }),
      map(({ docs }) => {
        const features = (docs as QueryDocumentSnapshot<QuestInfo>[]).map(doc => {

          const p = doc.data();
          const id = doc.id;

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: GeoHash.decode(id)
            },
            properties: { firestore_id: id, ...p }
          };
        });

        return {
          type: 'FeatureCollection',
          features
        } as GeoJSON.FeatureCollection<GeoJSON.Point, QuestProps>;
      })
    );
  }

  addQuest(prop: QuestInfo) {

    return this.questsRef.add(prop);
  }

  setQuestStatus(fid: string, newStatus: QuestStatus) {

    const quest = this.questsRef.doc<QuestInfo>(fid);

    return quest.update({ status: newStatus });
  }
}
