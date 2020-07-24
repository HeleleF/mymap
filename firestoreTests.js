
const fb = require('@firebase/testing');
const { exit } = require('process');
require("firebase/firestore");

const app = fb.initializeAdminApp({ projectId: "meine-pwa" });
const db = app.firestore();
db.settings({
    host: "localhost:8080",
    ssl: false
});

const gymsRef = db.collection("gyms");

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

const getGymsTest = async () => {

    try {
        const r = await gymsRef.get();
        console.log(r.size);
    } catch (e) {
        console.log(e);
        exit(-1);
    }

    console.log('done');
    exit(0);
};

uploadGyms();

