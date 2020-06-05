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
     * The current badge type for this gym
     */
    badge: number;
    /**
     * Whether this is a legacy gym
     */
    isLegacy?: boolean;
}