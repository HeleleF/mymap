const fs = require('fs').promises;

const fb = require('firebase');
const { exit } = require('process');
require('firebase/firestore');

console.log('firestore init...');
fb.initializeApp({
	apiKey: 'AIzaSyA1abJCUsKrI58kUPALI3Oz3nLJIgty4ZQ',
	authDomain: 'meine-pwa.firebaseapp.com',
	projectId: 'meine-pwa'
});
const db = fb.firestore();

const gymsRef = db.collection('gymsNEU');
const allBadges = [];

const uploadGym = (gym) => {
	const [lng, lat] = gym.geometry.coordinates;
	const { firestoreId, name, imageUrl, portalId, badge } = gym.properties;

	allBadges.push({
		firestoreId,
		badge
	});

	const payload = {
		n: name,
		i: imageUrl,
		p: portalId,
		l: new fb.firestore.GeoPoint(parseFloat(lat), parseFloat(lng))
	};

	return gymsRef.doc(firestoreId).set(payload);
};

const uploadBadge = (b) => {
	const medalRef = db.doc(
		`users/v0Y77Th7C5Mr6QoXdbX5gdMyDow2/medals/${b.firestoreId}`
	);
	return medalRef.set({ badge: b.badge });
};

const uploadGyms = async () => {
	const allGyms = require('./all.json');

	const proms = allGyms.filter((g) => g.properties.badge > 0).map(uploadGym);
	console.log('waiting', proms.length);

	await Promise.all(proms);

	console.log('done');

	const proms2 = allBadges.map(uploadBadge);
	console.log('waiting2', proms2.length);

	await Promise.all(proms2);

	console.log('done2');

	exit(0);
};

uploadGyms().catch((e) => {
	console.log(e.message);
	exit(-1);
});
