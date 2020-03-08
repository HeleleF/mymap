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

const d2r = Math.PI / 180;
const r2d = 1 / d2r;

const LatLngToXYZ = (latLng: { lat: number, lng: number }): XYZ => {
    const phi = latLng.lat * d2r;
    const theta = latLng.lng * d2r;
    const cosphi = Math.cos(phi);

    return [Math.cos(theta) * cosphi, Math.sin(theta) * cosphi, Math.sin(phi)];
};

const XYZToLatLng = (xyz: XYZ) => {
    const lat = Math.atan2(xyz[2], Math.sqrt(xyz[0] * xyz[0] + xyz[1] * xyz[1]));
    const lng = Math.atan2(xyz[1], xyz[0]);

    return { lat: lat * r2d, lng: lng * r2d };
};

const largestAbsComponent = (xyz: XYZ) => {
    const temp = [Math.abs(xyz[0]), Math.abs(xyz[1]), Math.abs(xyz[2])];

    if (temp[0] > temp[1]) {
        if (temp[0] > temp[2]) {
            return 0;
        }
        return 2;
    }

    if (temp[1] > temp[2]) {
        return 1;
    }

    return 2;
};

const faceXYZToUV = (face: Face, xyz: XYZ): UV => {
    let u, v;

    switch (face) {
        case 0: u = xyz[1] / xyz[0]; v = xyz[2] / xyz[0]; break;
        case 1: u = -xyz[0] / xyz[1]; v = xyz[2] / xyz[1]; break;
        case 2: u = -xyz[0] / xyz[2]; v = -xyz[1] / xyz[2]; break;
        case 3: u = xyz[2] / xyz[0]; v = xyz[1] / xyz[0]; break;
        case 4: u = xyz[2] / xyz[1]; v = -xyz[0] / xyz[1]; break;
        case 5: u = -xyz[1] / xyz[2]; v = -xyz[0] / xyz[2]; break;
        default: throw { error: 'Invalid face' };
    }

    return [u, v];
};

const XYZToFaceUV = (xyz: XYZ): [ Face, UV ] => {
    let face = largestAbsComponent(xyz);

    if (xyz[face] < 0) {
        face += 3;
    }

    const uv = faceXYZToUV(face as Face, xyz);

    return [face as Face, uv ];
};

const FaceUVToXYZ = (face: Face, uv: UV): XYZ => {
    const u = uv[0];
    const v = uv[1];

    switch (face) {
        case 0: return [1, u, v];
        case 1: return [-u, 1, v];
        case 2: return [-u, -v, 1];
        case 3: return [-1, -v, -u];
        case 4: return [v, -1, -u];
        case 5: return [v, u, -1];
        default: throw { error: 'Invalid face' };
    }
};

const STToUV = (st: ST): UV => {
    const singleSTtoUV = function (st: number) {
        if (st >= 0.5) {
            return (1 / 3.0) * (4 * st * st - 1);
        }
        return (1 / 3.0) * (1 - (4 * (1 - st) * (1 - st)));

    };

    return [singleSTtoUV(st[0]), singleSTtoUV(st[1])];
};

const UVToST = (uv: UV): ST => {
    const singleUVtoST = function (uv: number) {
        if (uv >= 0) {
            return 0.5 * Math.sqrt(1 + 3 * uv);
        }
        return 1 - 0.5 * Math.sqrt(1 - 3 * uv);

    };

    return [singleUVtoST(uv[0]), singleUVtoST(uv[1])];
};

const STToIJ = (st: ST, order: number): IJ => {
    const maxSize = 1 << order;

    const singleSTtoIJ = function (st: number) {
        const ij = Math.floor(st * maxSize);
        return Math.max(0, Math.min(maxSize - 1, ij));
    };

    return [singleSTtoIJ(st[0]), singleSTtoIJ(st[1])];
};

const IJToST = (ij: IJ, order: number, offsets: number[]): ST => {
    const maxSize = 1 << order;

    return [
        (ij[0] + offsets[0]) / maxSize,
        (ij[1] + offsets[1]) / maxSize
    ];
};

/**
 * The side of the cube
 */
type Face = 0 | 1 | 2 | 3 | 4 | 5;
type XYZ = [ number, number, number ];
type UV = [ number, number ];
type ST = [ number, number ];
type IJ = [ number, number ];

export class S2Cell {

    private face: Face;
    private ij: IJ;
    private level: number;

    constructor(f: Face, ij: IJ, lvl: number) {
        this.face = f;
        this.ij = ij;
        this.level = lvl;
    }

    /**
     * Creates a S2Cell from a latlng pair
     * @param latLng 
     * @param level 
     */
    static fromLatLng(latLng: any, level: number) {
        const xyz = LatLngToXYZ(latLng);
        const faceuv = XYZToFaceUV(xyz);
        const st = UVToST(faceuv[1]);
        const ij = STToIJ(st, level);

        return new S2Cell(faceuv[0], ij, level);
    }

    toString() {
        return `F${this.face}ij[${this.ij[0]}${this.ij[1]}]@${this.level}`;
    }

    getLatLng(offset: number[] = [0.5, 0.5]) {
        const st = IJToST(this.ij, this.level, offset);
        const uv = STToUV(st);
        const xyz = FaceUVToXYZ(this.face, uv);
    
        return XYZToLatLng(xyz);
    }

    getCornerLatLngs() {
        return [
            [0.0, 0.0],
            [0.0, 1.0],
            [1.0, 1.0],
            [1.0, 0.0]
        ].map(offset => this.getLatLng(offset));
    }

    getNeighbors() {

        const fromFaceIJWrap = (face: Face, ij: IJ, level: number) => {

            const maxSize = 1 << level;

            if (ij[0] >= 0 && ij[1] >= 0 && ij[0] < maxSize && ij[1] < maxSize) {
                // no wrapping out of bounds
                return new S2Cell(face, ij, level);
            }
    
            // the new i,j are out of range.
            // with the assumption that they're only a little past the borders we can just take the points as
            // just beyond the cube face, project to XYZ, then re-create FaceUV from the XYZ vector
            let st = IJToST(ij,level,[0.5, 0.5]);
            let uv = STToUV(st);
            let xyz = FaceUVToXYZ(face, uv);
            const faceuv = XYZToFaceUV(xyz);
            face = faceuv[0];
            uv = faceuv[1];
            st = UVToST(uv);
            ij = STToIJ(st,level);
            return new S2Cell(face, ij, level);
        };
    
        const face = this.face;
        const i = this.ij[0];
        const j = this.ij[1];
        const level = this.level;

        return [
            {a: -1, b: 0},
            {a: 0, b: -1},
            {a: 1, b: 0},
            {a: 0, b: 1}
        ].map(values => fromFaceIJWrap(face, [i + values.a, j + values.b], level));
    }
};




