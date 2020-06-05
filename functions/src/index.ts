import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
admin.initializeApp();

const db = admin.firestore();

export const setUserStatus = functions.region('europe-west1').auth.user().onCreate(user => {

    // when someone logs in the first time, assign the 'user' role
    return db.doc(`users/${user.uid}`).set({ role: 'user', uid: user.uid, photoURL: user.photoURL, displayName: user.displayName })
});