import { TestBed } from '@angular/core/testing';

import { DbService } from './db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

const AngularFirestoreStub = {
  collection: () => {
    return {
      get: () => {
        return of({
          size: 45,
          docs: [{
            id: '123',
            data: () => {
              return {
                i: 'id',
                u: 'url',
                b: 3,
                d: 'name',
                lon: 53.4,
                lat: 12.3
              }
            }
          }]
        });
      }
    }
  }
};

let store: any = {};
const mockLocalStorage = {
  getItem: (key: string): string => {
    return key in store ? store[key] : null;
  },
  setItem: (key: string, value: string) => {
    store[key] = `${value}`;
  }
};

describe('DbService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [{provide: AngularFirestore, useValue: AngularFirestoreStub}]
  }));

  it('should be created', () => {
    const service: DbService = TestBed.get(DbService);
    expect(service).toBeTruthy();
  });

  it('should return gyms as FeatureCollection', (done) => {
    
    const s1 = spyOn(localStorage, 'getItem').and.callFake(_ => null);
    const s2 = spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);

    const service: DbService = TestBed.get(DbService);

    service.getGyms().subscribe(g => {
      expect(g.type).toEqual('FeatureCollection');
      expect(g.features[0].properties.firestoreId).toEqual('123');
      expect(g.features[0].geometry.coordinates).toEqual([53.4, 12.3]);

      expect(s2).toHaveBeenCalledWith('gymsCached', 'true');
      expect(service.gymsCached).toBe(true);

      done();
    });
  });

  /*
  it('should return gyms from cache if wanted', () => {
    const service: DbService = TestBed.get(DbService);
  });

  // it should handle errors
  // firestoreMock als klasse etc

  it('should cache gyms if not already cached', () => {
    const service: DbService = TestBed.get(DbService);
  });

  it('should return quests as FeatureCollection', () => {
    const service: DbService = TestBed.get(DbService);
  });

  it('should return quests from cache if wanted', () => {
    const service: DbService = TestBed.get(DbService);
  });

  it('should cache quests if not already cached', () => {
    const service: DbService = TestBed.get(DbService);
  });

  it('should add non existing gym as new', () => {
    const service: DbService = TestBed.get(DbService);
  });

  it('should not add existing gym as new', () => {
    const service: DbService = TestBed.get(DbService);
  });

  it('should update badge of existing gym', () => {
    const service: DbService = TestBed.get(DbService);
  });

  it('should return all badge entries', () => {
    const service: DbService = TestBed.get(DbService);
  });
  */
});