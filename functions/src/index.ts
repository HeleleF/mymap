import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
admin.initializeApp();

const db = admin.firestore();

export const setUserStatus = functions.auth.user().onCreate(user => {

    db.doc(`users/${user.uid}`).set({
        isAdmin: false
    }).then(r => {
        console.log('returned ', r);
    }).catch(e => {
        console.log('error in onCreate', e);
    });

});