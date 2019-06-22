import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

import { GeoHash } from '../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  gymsRef: AngularFirestoreCollection<ApiModel.GymInfo>;
  stopsRef: AngularFirestoreCollection<ApiModel.StopInfo>;
  questsRef: AngularFirestoreCollection<ApiModel.QuestInfo>;

  constructor(private store: AngularFirestore) {
    this.gymsRef = this.store.collection<ApiModel.GymInfo>('gyms', ref => ref.limit(20));
    this.stopsRef = this.store.collection<ApiModel.StopInfo>('stops');
    this.questsRef = this.store.collection<ApiModel.QuestInfo>('quests', ref => ref.limit(20));
   }

  getGyms() {
    return this.gymsRef.snapshotChanges().pipe(map(actions => {
      return actions.map(item => {
        return {
          fid: item.payload.doc.id,
          ...item.payload.doc.data()
        } as ApiModel.GymInfo; 
      });
    }))

  }

  getGymsAsGeoJSON() {
    return this.gymsRef.snapshotChanges().pipe(map(actions => {

      return {
        type: 'FeatureCollection',
        features: actions.map(({payload: {doc: item}}) => {

          const p = item.data();
  
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [p.lon, p.lat]
            },
            properties: {
              fid: item.id,
              id: p.i,
              url: p.u,
              desc: p.d,
              badge: p.b
            }
          }; 
        })
      } as GeoJSON.FeatureCollection<GeoJSON.Point>;
    }));
  }

  async getGymsAsGeoJSON2() {

    const { docs } = await this.gymsRef.get().toPromise();

    await this.store.firestore.disableNetwork();

    const features = (docs as QueryDocumentSnapshot<ApiModel.GymInfo>[]).map(doc => {

      const p = doc.data();

      console.log('gyms came from ', doc.metadata.fromCache);

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
      features: features
    } as GeoJSON.FeatureCollection<GeoJSON.Point>
  }

  addGym(prop: ApiModel.GymInfo) {

    return from(this.gymsRef.add(prop));
  }

  setGymBadge(fid: string, newBadge: ApiModel.GymBadge) {

    const gym = this.gymsRef.doc<ApiModel.GymInfo>(fid);

    return gym.update({b: newBadge});
  }

  getStops() {
    return this.stopsRef.snapshotChanges().pipe(map(actions => {
      return actions.map(item => {
        return {
          fid: item.payload.doc.id,
          ...item.payload.doc.data()
        } as ApiModel.StopInfo; 
      });
    }))
  }

  getStopsAsGeoJSON() {
    return this.stopsRef.snapshotChanges().pipe(map(actions => {

      return {
        type: 'FeatureCollection',
        features: actions.map(({payload: {doc: item}}) => {

          const p = item.data();
  
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [p.longitude, p.latitude]
            },
            properties: {
              fid: item.id,
            }
          }; 
        })
      } as GeoJSON.FeatureCollection<GeoJSON.Point>;
    }))
  }

  getQuestsAsGeoJSON() {
    return this.questsRef.snapshotChanges().pipe(map(actions => {

      return {
        type: 'FeatureCollection',
        features: actions.map(({payload: {doc: item}}) => {

          const p = item.data();

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: GeoHash.decode(item.id)
            },
            properties: {
              fid: item.id,
              task: p.taskDesc,
              type: p.type,
              reward: p.reward,
              desc: p.stopName,
              status: p.status
            }
          }; 
        })
      } as GeoJSON.FeatureCollection<GeoJSON.Point>;
    }))
  }

  async getQuestsAsGeoJSON2() {

    const { docs } = await this.questsRef.get().toPromise();

    await this.store.firestore.disableNetwork();

    const features = (docs as QueryDocumentSnapshot<ApiModel.QuestInfo>[]).map(doc => {

      const p = doc.data();
      const id = doc.id;

      console.log('quests came from ', doc.metadata.fromCache);

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
      features: features
    } as GeoJSON.FeatureCollection<GeoJSON.Point, ApiModel.QuestInfo>
  }

  addQuest(prop: ApiModel.QuestInfo) {

    return from(this.questsRef.add(prop));
  }

  setQuestStatus(fid: string, newStatus: ApiModel.QuestStatus) {

    const quest = this.questsRef.doc<ApiModel.QuestInfo>(fid);

    return quest.update({status: newStatus});
  }
}
