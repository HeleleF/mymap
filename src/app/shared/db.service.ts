import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
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
    this.gymsRef = this.store.collection<ApiModel.GymInfo>('gyms');
    this.stopsRef = this.store.collection<ApiModel.StopInfo>('stops');
    this.questsRef = this.store.collection<ApiModel.QuestInfo>('quests');
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
              coordinates: [p.longitude, p.latitude]
            },
            properties: {
              fid: item.id,
              id: p.gymid,
              url: p.url,
              desc: p.description,
              badge: p.badge
            }
          }; 
        })
      } as GeoJSON.FeatureCollection<GeoJSON.Point>;
    }))
  }

  addGym(prop: ApiModel.GymInfo) {

    return from(this.gymsRef.add(prop));
  }

  setGymBadge(fid: string, newBadge: ApiModel.GymBadge) {

    const gym = this.gymsRef.doc<ApiModel.GymInfo>(fid);

    return from(gym.update({badge: newBadge}));
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

  addQuest(prop: ApiModel.QuestInfo) {

    return from(this.questsRef.add(prop));
  }

  setQuestStatus(fid: string, newStatus: ApiModel.QuestStatus) {

    const quest = this.questsRef.doc<ApiModel.QuestInfo>(fid);

    return from(quest.update({status: newStatus}));
  }
}
