// tslint:disable:no-bitwise

const b32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export class GeoHash {

    static encode = (lat: number, lng: number): string => {

        lat = Math.round(lat * 1e6) / 1e6;
        lng = Math.round(lng * 1e6) / 1e6;

        const chars: string[] = [];

        let bits = 0;
        let bitsTotal = 0;
        let hash = 0;
        let maxLat = 90;
        let minLat = -90;
        let maxLng = 180;
        let minLng = -180;
        let mid: number;

        while (chars.length < 12) {
            if (bitsTotal & 1) {

                mid = (maxLat + minLat) / 2;
                if (lat > mid) {
                    hash = (hash << 1) + 1;
                    minLat = mid;
                } else {
                    hash = hash << 1;
                    maxLat = mid;
                }

            } else {
                mid = (maxLng + minLng) / 2;
                if (lng > mid) {
                    hash = (hash << 1) + 1;
                    minLng = mid;
                } else {
                    hash = hash << 1;
                    maxLng = mid;
                }
            }

            bitsTotal++;
            if (++bits === 5) {
                chars.push(b32[hash]);
                bits = 0;
                hash = 0;
            }
        }
        return chars.join('');
    }

    /**
     * returns longitude first since Mapbox expects this order for the markers
     */
    static decode = (hash: string): [number, number] => {

        let isLng = true;
        let maxLat = 90;
        let minLat = -90;
        let maxLng = 180;
        let minLng = -180;
        let mid: number;
        let bit: number;
        let hashValue = 0;

        for (let i = 0; i < 12; i++) {

            hashValue = b32.indexOf(hash[i]);

            for (let bits = 5; bits--;) {
                bit = (hashValue >> bits) & 1;
                if (isLng) {
                    mid = (maxLng + minLng) / 2;
                    if (bit) {
                        minLng = mid;
                    } else {
                        maxLng = mid;
                    }
                } else {
                    mid = (maxLat + minLat) / 2;
                    if (bit) {
                        minLat = mid;
                    } else {
                        maxLat = mid;
                    }
                }
                isLng = !isLng;
            }
        }
        return [
            Math.round(((minLng + maxLng) / 2) * 1e6) / 1e6,
            Math.round(((minLat + maxLat) / 2) * 1e6) / 1e6
        ];
    }
}
