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

/**
 * Returns the keys for a given enum `E`.
 * 
 * `str` indicates whether we have to account for reverse mappings
 * (https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings)
 * Default is `true`.
 */
export function getKeys(E: any, str = true): string[] {

    const enumKeys = Object.keys(E);

    return str ? enumKeys.slice(enumKeys.length / 2) : enumKeys;
}

/**
 * Turns an array of x elements into an array
 * of arrays, where each innner array has length `columns`.
 *
 * The default value for `columns` is 3.
 * The original array is changed after calling this !!!
 *
 * ### Example:
 * ```js
 * const a = [0,1,2,3,4,5,6,7,8];
 * createRows(a);
 * console.log(a) // -> [ [0,1,2], [3,4,5], [6,7,8] ]
 * ```
 * Basically the opposite of `flatten()`.
 *
 * If the result of  `array.length / columns` is not an integer,
 * the last row will have only  `array.length % columns` elements.
 * ### Example 2:
 * ```js
 * const b = [0,1,2,3,4,5,6,7,8];
 * createRows(b, 4);
 * console.log(b) // -> [ [0,1,2,3], [4,5,6,7], [8] ]
 * ```
 */
export function createRows<T>(data: T[], columns = 3): T[][] {
    data.forEach((cur: any, idx: number, arr: any[]) => {

        // turn element into array -> create a new row
        arr[idx] = [cur];

        // push additional columns into the row, if they exist
        for (let i = 1; i < columns && arr[idx + i]; i++) {
            arr[idx].push(arr[idx + i]);
        }

        // remove all column elements
        arr = arr.splice(idx + 1, columns - 1);
    });
    return data as any;
}
