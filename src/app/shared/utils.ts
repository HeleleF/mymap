export const roundToSixDecimals = (val: string | number): number => {
	return Math.floor(+val * 1e6) / 1e6;
};

/**
 * Returns the keys for a given enum `enum_`.
 *
 * `removeReverseMappings` indicates whether we have to account for reverse mappings
 * (https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings)
 * Default is `true`.
 */
export function getKeys<E>(
	enum_: E,
	removeReverseMappings = true
): (keyof E)[] {
	const enumKeys = Object.keys(enum_);
	return (
		removeReverseMappings ? enumKeys.slice(enumKeys.length / 2) : enumKeys
	) as (keyof E)[];
}
