namespace ApiModel {

    export enum GymBadge {
        NOT_SEEN = 0,
        SEEN = 1,
        BRONZE = 2,
        SILVER = 3,
        GOLD = 4
    };

    export interface StopInfo {
        fid: string,
        id?: string,
        name: string,
        description?: string,
        latitude: number,
        longitude: number,
        imageUrl?: string
    };

    export interface GymInfo {
        fid: string,
        gymid?: string,
        description: string,
        latitude: number,
        longitude: number,
        url?: string,
        badge: number
    };

    export enum QuestStatus {
        NOT_DONE = 0,
        IN_PROGRESS = 1,
        DONE = 2
    }

    export enum QuestType {
        QUEST_CATCH_POKEMON,
        QUEST_USE_BERRY_IN_ENCOUNTER,
        QUEST_GET_BUDDY_CANDY,
        QUEST_LAND_THROW,
        QUEST_COMPLETE_RAID_BATTLE,
        QUEST_COMPLETE_GYM_BATTLE,
        QUEST_HATCH_EGG,
        QUEST_TRADE_POKEMON,
        QUEST_SPIN_POKESTOP,
        QUEST_EVOLVE_POKEMON,
        QUEST_TRANSFER_POKEMON,
        QUEST_SEND_GIFT
    }

    export interface QuestInfo {
        stopName: string,
        taskDesc: string,
        status: QuestStatus,
        type: QuestType,
        reward: string,
        encounter?: string,
        quantity?: number
    };
}