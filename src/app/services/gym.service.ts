import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { GymModel, GymProps, BadgeEntry, asGeopoint } from '../model/gym.model';
import { map, flatMap } from 'rxjs/operators';

import { of, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GymService {

  private gymsRef: AngularFirestoreCollection<GymModel>;

  constructor(private store: AngularFirestore) {
      this.gymsRef = this.store.collection<GymModel>('gyms', ref => ref.orderBy('n', 'asc'));
  }

  getEntries() {
    return this.gymsRef.get({ source: 'cache' }).pipe(
      map(({ docs }) => {

        return (docs as QueryDocumentSnapshot<GymModel>[]).map(doc => {

          const gym = doc.data();
          return { u: gym.i, d: gym.n, f: doc.id } as BadgeEntry;
        });
      })
    ); 
  }

  getGyms() {

    return this.gymsRef.get().pipe(
      map(({ docs }) => {

        const features = (docs as QueryDocumentSnapshot<GymModel>[]).map(doc => {

          const gym = doc.data();

          const props: GymProps = {
            firestoreId: doc.id,
            portalId: gym.p,
            imageUrl: gym.i,
            name: gym.n,
          };

          if (gym.r) props.isLegacy = true;

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [gym.l.longitude, gym.l.latitude]
            },
            properties: props,
          };
        });

        return {
          type: 'FeatureCollection',
          features
        } as GeoJSON.FeatureCollection<GeoJSON.Point, GymProps>;

      })
    );
  }

  update({firestoreId, name, imageUrl, pos, isLegacy }: GymProps & { pos: string[] }) {
    const [ lng, lat ] = pos;

    const newValues: Partial<GymModel> = { n: name, i: imageUrl, l: asGeopoint(lat, lng) };

    // if its not legacy, we dont need to add an extra property, since the default is false already
    // the other way around is not needed, since gyms marked as legacy are 'gone' forever
    if (isLegacy) newValues.r = true;

    const gym = this.gymsRef.doc<GymModel>(firestoreId);
    return gym.update(newValues);
  }

  create(newGym: GymModel) {

    const sameGyms = this.store.collection<GymModel>('gyms', ref => ref.where('p', '==', newGym.p));

    return sameGyms.get().pipe(
      flatMap((snap) => {

        // at least one other gym with this id already exists, return error
        if (snap.size) {
          return of(null);
        }

        // gym id is not used yet, add the gym
        return from(this.gymsRef.add(newGym)).pipe(

          map((newGymRef) => {

            const props: GymProps = {
              firestoreId: newGymRef.id,
              portalId: newGym.p,
              imageUrl: newGym.i,
              name: newGym.n,
            };
  
            if (newGym.r) props.isLegacy = true;

            return ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [newGym.l.longitude, newGym.l.latitude]
              },
              properties: props
            }) as GeoJSON.Feature<GeoJSON.Point, GymProps>;

          })

        );
      })
    );
  }
}
