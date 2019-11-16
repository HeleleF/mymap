export enum GymBadge {
    NOT_SEEN = 0,
    SEEN = 1,
    BRONZE = 2,
    SILVER = 3,
    GOLD = 4
}

export interface GymInfo {
    fid?: string;
    i?: string;
    d: string;
    lat: number;
    lon: number;
    u?: string;
    b: number;
}

export interface GymFilter {
    badges?: GymBadge[];
    negateBadge?: boolean;
}

export interface BadgeEntry {
    d: string;
    u: string;
    b: GymBadge;
}