
import * as request from 'request-promise-native';
const fs = require('fs').promises;

import * as fb from 'firebase';
import "firebase/firestore";

console.log('firestore init...');
fb.initializeApp({
    apiKey: "AIzaSyA1abJCUsKrI58kUPALI3Oz3nLJIgty4ZQ",
    authDomain: "meine-pwa.firebaseapp.com",
    projectId: "meine-pwa"
});
const db = fb.firestore();
console.log('starting...');

const addGyms = async () => {

    const gymsRef = db.collection("gyms");

    const data = require('../../CustomMap/myGymMap/neu.json');
    console.log(data.length);

    try {
        await Promise.all(data.map(d => {
            gymsRef.add({
                i: d.gym_id,
                d: d.description,
                u: d.url,
                lat: d.latitude,
                lon: d.longitude,
                b: d.badge
            });
        }));
    } catch (e) {
        console.log(e.message);
        return;
    }

    console.log("done");
};

const geohash = (lat: number, lng: number) => {

    lat = Math.round(lat * 1e6) / 1e6;
    lng = Math.round(lng * 1e6) / 1e6;

    const b32 = '0123456789bcdefghjkmnpqrstuvwxyz';

    let chars = [],
        bits = 0,
        bitsTotal = 0,
        hash_value = 0,
        maxLat = 90,
        minLat = -90,
        maxLon = 180,
        minLon = -180,
        mid;

    while (chars.length < 12) {
        if (bitsTotal & 1) {

            mid = (maxLat + minLat) / 2;
            if (lat > mid) {
                hash_value = (hash_value << 1) + 1;
                minLat = mid;
            } else {
                hash_value = hash_value << 1;
                maxLat = mid;
            }

        } else {
            mid = (maxLon + minLon) / 2;
            if (lng > mid) {
                hash_value = (hash_value << 1) + 1;
                minLon = mid;
            } else {
                hash_value = hash_value << 1;
                maxLon = mid;
            }
        }

        bitsTotal++;
        if (++bits === 5) {
            chars.push(b32[hash_value]);
            bits = 0;
            hash_value = 0;
        }
    }
    return chars.join('');
};

const loadQuests = async (latLng = null) => {

    const QFILE = 'questSpec.json';

    let s: string;

    try {

        s = await fs.readFile(QFILE, 'utf8');

    } catch (e) {
        console.log(e.message);
        return;
    }

    const spec = JSON.parse(s);
    const qids = Object.keys(spec).map(Number);
    let changed = false;

    let s2cellIds = [];

    if (latLng) {

        const s2 = require('s2-geometry').S2;
        const key = s2.latLngToKey(latLng);

        s2cellIds.push(key.replace('/', '-'));

    } else {
        s2cellIds = [
            '2-0331101333'
        ];
    }

    const a = await Promise.all(s2cellIds.map(async id => {

        const r = await request({
            url: `https://www.bookofquests.de/quests/${id}/0`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
                'Referer': 'https://www.bookofquests.de/',
                'X-Requested-With': 'XMLHttpRequest'
            },
            json: true
        });
        return r.map(q => {
            let o: any = {
                stopName: q.stop.name,
                hash: geohash(q.stop.loc.coordinates[1], q.stop.loc.coordinates[0]),
                reward: q.reward.rewardType,
                qid: q.quest.questid
            };
            if (o.reward === '#') {
                o.encounter = q.reward.encounterId;
            } else {
                o.quantity = q.reward.rewardNum;
            }
            return o;
        });
    }));

    const quests = [].concat(...a);

    // call cloud function to delete the quests collection

    const questsRef = db.collection("quests");
    const proms = [];

    for (let i = quests.length; i--;) {

        const q = Object.assign({}, quests[i]);

        if (!qids.includes(q.qid)) {

            console.log(`Getting definition for task id ${q.qid}...`);

            try {
                const r = await request({
                    url: `https://www.bookofquests.de/def/task/${q.qid}`,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
                        'Referer': 'https://www.bookofquests.de/',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    json: true
                });

                qids.push(r.id);
                spec[r.id] = r;
                changed = true;

            } catch (e) {
                console.log(e.message);
                return;
            }
        }

        q.taskDesc = spec[q.qid].de;
        q.status = 0;
        q.type = spec[q.qid].questSpec.type;
        delete q.qid;

        const hid = q.hash;
        delete q.hash;

        proms.push(questsRef.doc(hid).set(q));
    }

    console.log('Awaiting promises...');

    try {

        await Promise.all(proms);

    } catch (e) {
        
        console.log(e.message);

    } finally {

        if (changed) {
            await fs.writeFile(QFILE, JSON.stringify(spec, null, 2));
        }
        console.log('Done.');
    }
};

loadQuests();


