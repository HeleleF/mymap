
const fs = require('fs').promises;

const fb = require('firebase');
const { exit } = require('process');
require("firebase/firestore");

console.log('firestore init...');
fb.initializeApp({
    apiKey: "AIzaSyA1abJCUsKrI58kUPALI3Oz3nLJIgty4ZQ",
    authDomain: "meine-pwa.firebaseapp.com",
    projectId: "meine-pwa"
});
const db = fb.firestore();

const gymsRef = db.collection("gyms").limit(10);

const uploadGym = (gym) => {
    
    const [ lng, lat ] = gym.geometry.coordinates;
    const { firestoreId, name, imageUrl, badge, portalId } = gym.properties;

    const payload = {
        n: name,
        i: imageUrl,
        b: badge,
        p: portalId,
        l: new fb.firestore.GeoPoint(parseFloat(lat), parseFloat(lng))
    };

    return gymsRef.doc(firestoreId).set(payload);
};

const uploadGyms = async () => {

    const allGyms = require('./all.json');

    const proms = allGyms.filter(g => g.properties.badge > 0).map(uploadGym);
    console.log('waiting', proms.length);

    await Promise.all(proms);
        
    console.log('done');
    exit(0);
};

const getGyms = async () => {

    try {
        const r = await gymsRef.get();
        console.log(r.size, r.docs);
    } catch (e) {
        console.log(e);
        exit(-1);
    }

    console.log('done');
    exit(0);
};

getGyms();

