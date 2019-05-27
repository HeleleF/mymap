'use strict';

const fb = require('firebase');

require("firebase/firestore");

fb.initializeApp({
    apiKey: "AIzaSyA1abJCUsKrI58kUPALI3Oz3nLJIgty4ZQ",
    authDomain: "meine-pwa.firebaseapp.com",
    projectId: "meine-pwa"
  });
  console.log("init");

const db = fb.firestore();
const gymsRef = db.collection("gyms");

console.log("ref set");

const data = require('../../CustomMap/myGymMap/neu.json');
console.log(data.length);

data.forEach(d => {
    gymsRef.add({
        i: d.gym_id,
        d: d.description,
        u: d.url,
        lat: d.latitude,
        lon: d.longitude,
        b: d.badge
    })
    .then(docRef => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(console.error);
});