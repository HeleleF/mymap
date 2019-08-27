
const request = require('request-promise-native');
const fs = require('fs').promises;

const fb = require('firebase');
require("firebase/firestore");

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

const geohash = (lat, lng) => {

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

    let s;

    try {

        s = await fs.readFile(QFILE, 'utf8');

    } catch (e) {
        console.log(e.message);
        return;
    }

    const spec = JSON.parse(s);
    const qids = Object.keys(spec).map(Number);
    let changed = false;

    let s2cellIds;

    if (latLng) {

        const s2 = require('s2-geometry').S2;

        if (latLng.length) {
            s2cellIds = latLng.map(ll => s2.latLngToKey(ll).replace('/', '-'));
        } else {
            s2cellIds = [s2.latLngToKey(latLng).replace('/', '-')];
        }


    } else {
        s2cellIds = ['2-0331101333', '2-0331100222']; //hdf only

        // berlin alles
        /*
        s2cellIds = [
            "2/0331101322", "2/0331103212", "2/0331100233", "2/0331100231", "2/0331100202", "2/0331100203", "2/0331100130", "2/0331100131", "2/0331100102", "2/0331100230",
            "2/0331101323", "2/0331100113", "2/0331100123", "2/0331100120", "2/0331100213", "2/0331100210", "2/0331100220", "2/0331101320", "2/0331100223", "2/0331101330",
            "2/0331100121", "2/0331101331", "2/0331100211", "2/0331100122", "2/0331100221", "2/0331100212", "2/0331100222", "2/0331101333", "2/0331101332", "2/0331103211",
            "2/0331103121", "2/0331103122", "2/0331103111", "2/0331103112"
        ].map(k => k.replace('/', '-'));
        */
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
        return r.filter(q => !!q.reward).map(q => {
            let o = {
                stopName: q.stop.name,
                hash: geohash(q.stop.loc.coordinates[1], q.stop.loc.coordinates[0]),
                reward: q.reward.rewardType,
                qid: q.quest.questid
            };
            if (o.reward === '#') {
                
                try {
                    o.encounter = q.reward.encounterId.padStart(3, 0);
                } catch (e) {
                    o.encounter = 'multiple';
                    o.possible = q.reward.possibleEncounters;
                }
                
            } else {
                o.quantity = q.reward.rewardNum;
            }
            return o;
        });
    }));

    const quests = [].concat(...a);
    console.log(`got ${quests.length} quests`);

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
        q.type = spec[q.qid].questSpec ? spec[q.qid].questSpec.type : 'QUEST_UNKNOWN';
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

const downloadAssets1 = async () => {

    const r = await request({
        url: `https://www.bookofquests.de/def/pokemon/all`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
            'Referer': 'https://www.bookofquests.de/',
            'accept-encoding': 'gzip, deflate, br',
            'X-Requested-With': 'XMLHttpRequest'
        },
        json: true
    });

    const all = Object.values(r).map(p => p.svg);

    for (let i = all.length; i--;) {
        const f = all[i];

        try {
            request({
                url: `https://www.bookofquests.de/svg/${f}.svg`,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
                    'Referer': 'https://www.bookofquests.de/',
                    'accept-encoding': 'gzip, deflate, br',
                }
            }).pipe(fs.createWriteStream(`src/assets/quests/${f}.svg`));
        } catch (e) {
            console.log(f, ' möp ', e.message);
        }
    }
};

const downloadAssets2 = async () => {

    const j = await request({
        url: `https://www.bookofquests.de/def/itemrewards`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
            'Referer': 'https://www.bookofquests.de/',
            'accept-encoding': 'gzip, deflate, br',
            'X-Requested-With': 'XMLHttpRequest'
        },
        json: true
    });

    for (let i = j.length; i--;) {
        let f = j[i].icon;

        if (!f) continue;

        if (!f.startsWith('/')) f = `/${f}`;

        const l = f.split('/').pop();

        try {
            request({
                url: `https://www.bookofquests.de${f}`,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
                    'Referer': 'https://www.bookofquests.de/',
                    'accept-encoding': 'gzip, deflate, br',
                }
            }).pipe(fs.createWriteStream(`src/assets/quests/${l}`));
        } catch (e) {
            console.log(f, ' möp ', e.message);
        }
    }
};

(async () => {
    await loadQuests();
    console.log('Done.');
})();

