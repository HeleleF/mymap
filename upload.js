"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var request = require("request-promise-native");
var fs = require('fs').promises;
var fb = require("firebase");
require("firebase/firestore");
console.log('firestore init...');
fb.initializeApp({
    apiKey: "AIzaSyA1abJCUsKrI58kUPALI3Oz3nLJIgty4ZQ",
    authDomain: "meine-pwa.firebaseapp.com",
    projectId: "meine-pwa"
});
var db = fb.firestore();
console.log('starting...');
var addGyms = function () { return __awaiter(_this, void 0, void 0, function () {
    var gymsRef, data, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                gymsRef = db.collection("gyms");
                data = require('../../CustomMap/myGymMap/neu.json');
                console.log(data.length);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.all(data.map(function (d) {
                        gymsRef.add({
                            i: d.gym_id,
                            d: d.description,
                            u: d.url,
                            lat: d.latitude,
                            lon: d.longitude,
                            b: d.badge
                        });
                    }))];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log(e_1.message);
                return [2 /*return*/];
            case 4:
                console.log("done");
                return [2 /*return*/];
        }
    });
}); };
var geohash = function (lat, lng) {
    lat = Math.round(lat * 1e6) / 1e6;
    lng = Math.round(lng * 1e6) / 1e6;
    var b32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    var chars = [], bits = 0, bitsTotal = 0, hash_value = 0, maxLat = 90, minLat = -90, maxLon = 180, minLon = -180, mid;
    while (chars.length < 12) {
        if (bitsTotal & 1) {
            mid = (maxLat + minLat) / 2;
            if (lat > mid) {
                hash_value = (hash_value << 1) + 1;
                minLat = mid;
            }
            else {
                hash_value = hash_value << 1;
                maxLat = mid;
            }
        }
        else {
            mid = (maxLon + minLon) / 2;
            if (lng > mid) {
                hash_value = (hash_value << 1) + 1;
                minLon = mid;
            }
            else {
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
var loadQuests = function (latLng) {
    if (latLng === void 0) { latLng = null; }
    return __awaiter(_this, void 0, void 0, function () {
        var QFILE, s, e_2, spec, qids, changed, s2cellIds, s2, key, a, quests, questsRef, proms, i, q, r, e_3, hid, e_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    QFILE = 'questSpec.json';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(QFILE, 'utf8')];
                case 2:
                    s = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    console.log(e_2.message);
                    return [2 /*return*/];
                case 4:
                    spec = JSON.parse(s);
                    qids = Object.keys(spec).map(Number);
                    changed = false;
                    s2cellIds = [];
                    if (latLng) {
                        s2 = require('s2-geometry').S2;
                        key = s2.latLngToKey(latLng);
                        s2cellIds.push(key.replace('/', '-'));
                    }
                    else {
                        s2cellIds = [
                            '2-0331101333'
                        ];
                    }
                    return [4 /*yield*/, Promise.all(s2cellIds.map(function (id) { return __awaiter(_this, void 0, void 0, function () {
                            var r;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, request({
                                            url: "https://www.bookofquests.de/quests/" + id + "/0",
                                            headers: {
                                                'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
                                                'Referer': 'https://www.bookofquests.de/',
                                                'X-Requested-With': 'XMLHttpRequest'
                                            },
                                            json: true
                                        })];
                                    case 1:
                                        r = _a.sent();
                                        return [2 /*return*/, r.map(function (q) {
                                                var o = {
                                                    stopName: q.stop.name,
                                                    hash: geohash(q.stop.loc.coordinates[1], q.stop.loc.coordinates[0]),
                                                    reward: q.reward.rewardType,
                                                    qid: q.quest.questid
                                                };
                                                if (o.reward === '#') {
                                                    o.encounter = q.reward.encounterId;
                                                }
                                                else {
                                                    o.quantity = q.reward.rewardNum;
                                                }
                                                return o;
                                            })];
                                }
                            });
                        }); }))];
                case 5:
                    a = _a.sent();
                    quests = [].concat.apply([], a);
                    questsRef = db.collection("quests");
                    proms = [];
                    i = quests.length;
                    _a.label = 6;
                case 6:
                    if (!i--) return [3 /*break*/, 12];
                    q = Object.assign({}, quests[i]);
                    if (!!qids.includes(q.qid)) return [3 /*break*/, 10];
                    console.log("Getting definition for task id " + q.qid + "...");
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, request({
                            url: "https://www.bookofquests.de/def/task/" + q.qid,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
                                'Referer': 'https://www.bookofquests.de/',
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            json: true
                        })];
                case 8:
                    r = _a.sent();
                    qids.push(r.id);
                    spec[r.id] = r;
                    changed = true;
                    return [3 /*break*/, 10];
                case 9:
                    e_3 = _a.sent();
                    console.log(e_3.message);
                    return [2 /*return*/];
                case 10:
                    q.taskDesc = spec[q.qid].de;
                    q.status = 0;
                    q.type = spec[q.qid].questSpec.type;
                    delete q.qid;
                    hid = q.hash;
                    delete q.hash;
                    proms.push(questsRef.doc(hid).set(q));
                    _a.label = 11;
                case 11: return [3 /*break*/, 6];
                case 12:
                    console.log('Awaiting promises...');
                    _a.label = 13;
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, Promise.all(proms)];
                case 14:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 15:
                    e_4 = _a.sent();
                    console.log(e_4.message);
                    return [2 /*return*/];
                case 16:
                    if (!changed) return [3 /*break*/, 18];
                    return [4 /*yield*/, fs.writeFile(QFILE, JSON.stringify(spec, null, 2))];
                case 17:
                    _a.sent();
                    _a.label = 18;
                case 18:
                    console.log('Done.');
                    return [2 /*return*/];
            }
        });
    });
};
loadQuests();
