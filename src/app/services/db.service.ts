import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';

import { GeoHash, createRows } from '../shared/utils';

import { map } from 'rxjs/operators';
import { GymInfo, GymBadge, BadgeEntry } from '../model/gym.model';
import { QuestInfo, QuestStatus } from '../model/quest.model';

/**
 * A service to query the firestore database.
 */
@Injectable({
  providedIn: 'root'
})
export class DbService {

  gymsRef: AngularFirestoreCollection<GymInfo>;
  questsRef: AngularFirestoreCollection<QuestInfo>;
  private gymsCached: boolean;
  private questsCached: boolean;
  private expire: number;

  constructor(private store: AngularFirestore) {

    this.gymsRef = this.store.collection<GymInfo>('gyms', ref => ref.where('b', '>', 0)); // , ref => ref.limit(150));
    this.questsRef = this.store.collection<QuestInfo>('quests'); // , ref => ref.limit(150));

    this.gymsCached = JSON.parse(localStorage.getItem('gymsCached') || '0');
    this.questsCached = JSON.parse(localStorage.getItem('questsCached') || '0');
    this.expire = +localStorage.getItem('questsExpire');
  }

  /**
   * Returns all gyms from firestore as GeoJSON FeatureCollection.
   * 
   * Uses the cache if possible.
   */
  async getGyms() {

    const opts: firestore.GetOptions = this.gymsCached ? { source: 'cache' } : {};

    const { docs } = await this.gymsRef.get(opts).toPromise();

    if (!this.gymsCached) {
      this.gymsCached = true;
      localStorage.setItem('gymsCached', 'true');
    }

    const features = (docs as QueryDocumentSnapshot<GymInfo>[]).map(doc => {

      const p = doc.data();

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.lon, p.lat]
        },
        properties: {
          fid: doc.id,
          id: p.i,
          url: p.u,
          desc: p.d,
          badge: p.b
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    } as GeoJSON.FeatureCollection<GeoJSON.Point>;
  }

  /**
   * Adds a new gym to firestore and returns
   * its data as GeoJSON
   * 
   * **TODO(helene): Don't add gym if it already exists! 
   * Query by gym_id to check?**
   */
  async addGym(p: GymInfo): Promise<GeoJSON.Feature> {

    const ref = await this.gymsRef.add(p);

    return ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.lon, p.lat]
      },
      properties: {
        fid: ref.id,
        id: p.i,
        url: p.u,
        desc: p.d,
        badge: p.b
      }
    });
  }

  /**
   * Updates the badge of an existing gym.
   */
  setGymBadge(fid: string, newBadge: GymBadge) {

    const gym = this.gymsRef.doc<GymInfo>(fid);
    return gym.update({ b: newBadge });
  }

  /**
   * Returns an object that contains the counts of each badge type and an array containing
   * all gyms as rows of three each.
   * 
   * Always uses the cache!
   */
  getAllBadgeEntries$() {
    return this.store.collection<GymInfo>('gyms', ref => ref.where('b', '>', 0).orderBy('b', 'desc').orderBy('d', 'asc')).get({ source: 'cache' }).pipe(
      map((r: QuerySnapshot<GymInfo>) => {

        const badgeTypeCounts = [0, 0, 0, 0];

        const badgeEntries = r.docs.map(s => {
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
  async getQuests() {

    // quests in cache are from the previous day, request new ones from server
    /*
    if (this.questsCached && (this.expire < Date.now())) {
      console.log('expired');
      this.questsCached = false;
    }
    */

    const opts: firestore.GetOptions = this.questsCached ? { source: 'cache' } : {};

    const { docs } = await this.questsRef.get(opts).toPromise();

    // quests are now cached until the next day at 6am
    if (!this.questsCached) {
      this.questsCached = true;
      localStorage.setItem('questsCached', 'true');

      this.expire = new Date().setHours(30, 0, 0, 0);
      localStorage.setItem('questsExpire', `${this.expire}`);
    }

    const features = (docs as QueryDocumentSnapshot<QuestInfo>[]).map(doc => {

      const p = doc.data();
      const id = doc.id;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: GeoHash.decode(id)
        },
        properties: { id, ...p }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    } as GeoJSON.FeatureCollection<GeoJSON.Point, QuestInfo>;
  }

  addQuest(prop: QuestInfo) {

    return this.questsRef.add(prop);
  }

  setQuestStatus(fid: string, newStatus: QuestStatus) {

    const quest = this.questsRef.doc<QuestInfo>(fid);

    return quest.update({ status: newStatus });
  }
}