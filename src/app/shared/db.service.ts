import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private store: AngularFirestore) { }

  getQuests() {
    return this.store.collection('quests').snapshotChanges();
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
