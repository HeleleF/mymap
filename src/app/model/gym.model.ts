import fb from 'firebase/app';

export enum GymBadge {
    NOT_SEEN = 0,
    SEEN = 1,
    BRONZE = 2,
    SILVER = 3,
    GOLD = 4
}

export interface GymInfo {
    fid?: string;
    i: string;
    d: string;
    lat: number;
    lon: number;
    u: string;
    b: number;
    l?: boolean;
}

/**
 * How gyms are stored in Firestore
 * Properties are as short as possible to save space :)
 */
export interface GymModel {
    /**
     * The URI for the gym image without the scheme
     */
    i: string;
    /**
     * The name of the gym
     */
    n: string;
    /**
     * The unique portal ID from the ingress intel map
     */
    p: string;
    /**
     * The position of the gym as a firestore.GeoPoint
     */
    l: fb.firestore.GeoPoint;
    /**
     * Whether this is a legacy gym
     */
    r?: boolean;
}

export interface GymFilter {
    badges: GymBadge[];
    negateBadge?: boolean;
    includeLegacy: boolean;
}

/**
 * A gym badge entry
 */
export interface BadgeEntry {
    /**
     * The firestore id of the gym
     */
    f: string;
    /**
     * The name of the gym
     */
    d: string;
    /**
     * The URI for the gym image without the scheme
     */
    u: string;
    /**
     * The current badge type for this gym
     */
    b: GymBadge;
}

/**
 * GeoJSON Properties for a gym
 */
export interface GymProps {
    /**
     * The name of the gym
     */
    name: string;
    /**
     * The URI for the gym image without the scheme
     */
    imageUrl: string;
    /**
     * The unique firestore document ID, generated automatically
     */
    firestoreId: string;
    /**
     * The unique portal ID from the ingress intel map
     */
    portalId: string;
    /**
     * Whether this is a legacy gym
     */
    isLegacy?: boolean;
}

export interface BadgeCollection {
    [gymFirestoreId: string]: number
}

export interface MedalCount {
    [badgeType: number]: number
}

/**
 * Creates a new GeoPoint for storing locations in firestore.
 * Values are rounded to 6 decimals (same as ingress, more than enough)
 */
export const asGeopoint = (latitude: string | number, longitude: string | number): fb.firestore.GeoPoint => {

    const lat = Math.floor(+latitude * 1e6) / 1e6;
    const lng = Math.floor(+longitude * 1e6) / 1e6;

    return new fb.firestore.GeoPoint(lat, lng);
}

export interface NewGymData {
    name: string;
    pos: string;
    id: string;
    url: string;
    badge: keyof typeof GymBadge;
}

export interface UpdateGymData {
    [key: string]: string;

    name: string;

    imageUrl: string;
    portalId: string;
    lat: string;
    lng: string;

    firestoreId: string;
}

export interface BadgeUpdate {
    firestoreId: string;
    newBadge: number;
}

export interface CreatedGymData {
    gym: GeoJSON.Feature<GeoJSON.Point, GymProps>;
    badge: number;
}