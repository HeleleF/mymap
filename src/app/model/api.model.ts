namespace ApiModel {

    export interface GymBadgeInfo {
        gymId: string;
        gymBadge: number;
    };

    export interface StopInfo {
        id?: string,
        name: string,
        description?: string,
        latitude: number,
        longitude: number,
        imageUrl?: string
    };

    export interface GymInfo {
        id?: string,
        name: string,
        description?: string,
        latitude: number,
        longitude: number,
        imageUrl?: string,
        badge: number
    };
}