import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

import { GeoHash } from '../shared/utils';
import { QuestInfo, GymInfo, GymBadge, QuestStatus } from '../model/api.model';

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

  async getGyms() {

    const opts: firebase.firestore.GetOptions = this.gymsCached ? {source: 'cache'} : {};

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
          url: p.u.replace(/^https?\:\/\//, ''),
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

  async getBadgeCount() {

    // TODO: für alle: immer cache zuerst, bei fehler nachfragen ob ohne
    // wenn dann nochmal fehler kommt, ansagen
    // settings kann das überschreiben?

    const opts: firebase.firestore.GetOptions = this.gymsCached ? { source: 'cache' } : {};

    const { docs } = await this.gymsRef.get(opts).toPromise();

    if (!this.gymsCached) {
      this.gymsCached = true;
      localStorage.setItem('gymsCached', 'true');
    }

    return (docs as QueryDocumentSnapshot<GymInfo>[]).reduce((acc, doc) => {

      const b = doc.data().b;

      if (b === 0) { return acc; }

      acc[b - 1] += 1;

      return acc;

    }, [0, 0, 0, 0]);
  }

  setGymBadge(fid: string, newBadge: GymBadge) {

    const gym = this.gymsRef.doc<GymInfo>(fid);
    return gym.update({b: newBadge});
  }

  async getQuests() {

    // quests in cache are from the previous day, request new ones from server
    /*
    if (this.questsCached && (this.expire < Date.now())) {
      console.log('expired');
      this.questsCached = false;
    }
    */

    const opts: firebase.firestore.GetOptions = this.questsCached ? { source: 'cache' } : {};

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
        properties: {id, ...p}
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

    return quest.update({status: newStatus});
  }
}
