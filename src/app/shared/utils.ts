const b32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export class GeoHash {

    static encode = (lat: number, lng: number): string => {

        lat = Math.round(lat * 1e6) / 1e6;
        lng = Math.round(lng * 1e6) / 1e6;

        let chars: string[] = [],
            bits = 0,
            bitsTotal = 0,
            hash_value = 0,
            maxLat = 90,
            minLat = -90,
            maxLon = 180,
            minLon = -180,
            mid: number;

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
    }

    /**
     * returns longitude first since Mapbox expects this order for the markers
     */
    static decode = (hash: string): [number, number] => {

        let isLng = true,
            maxLat = 90,
            minLat = -90,
            maxLng = 180,
            minLng = -180,
            mid: number,
            bit: number,
            hashValue = 0;

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
