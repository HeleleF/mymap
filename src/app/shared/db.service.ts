import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  gymsRef: AngularFirestoreCollection<ApiModel.GymInfo>;

  constructor(private store: AngularFirestore) {
    this.gymsRef = this.store.collection<ApiModel.GymInfo>('gyms');
   }

  getGyms() {
    return this.gymsRef.snapshotChanges();
  }

  addQuest() {
    // auf der map einen stop anklicken, und eine quest auswählen, dann wird die zum firestore hinzugefügt
  }

  addMultipleQuests() {
    // mehrere gleichzeitig
  }

  setQuestStatus() {
    // für eine existierende quest auswählen, NICHT_GEMACHT, AUFGENOMMEN oder ERLEDIGT
  }

  setMultipleQuestStatus() {
    // mehrere gleichzeitig
  }
}
