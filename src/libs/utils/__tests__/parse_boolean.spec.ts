import { parseBoolean } from '../parse_boolean.util';

describe('parseBoolean', () => {
	it('returns true for "true" (case-insensitive)', () => {
		expect(parseBoolean('true')).toBe(true);
		expect(parseBoolean('TRUE')).toBe(true);
		expect(parseBoolean(' TrUe ')).toBe(true);
	});

	it('returns false for "false" (case-insensitive)', () => {
		expect(parseBoolean('false')).toBe(false);
		expect(parseBoolean('FALSE')).toBe(false);
		expect(parseBoolean(' FaLsE ')).toBe(false);
	});

	it('throws error for invalid string values', () => {
		expect(() => parseBoolean('yes')).toThrow(
			'Can not cast "yes" to boolean.'
		);
		expect(() => parseBoolean('0')).toThrow();
		expect(() => parseBoolean('')).toThrow();
	});

	it('throws error for non-boolean-like values', () => {
		expect(() => parseBoolean('null')).toThrow();

		expect(() => parseBoolean('undefined')).toThrow();
	});
});
