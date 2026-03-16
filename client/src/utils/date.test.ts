import { describe, it, expect } from 'vitest';
import { fromNow } from './date';

describe('fromNow', () => {
	it('returns a relative time string', () => {
		const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
		expect(fromNow(fiveMinAgo)).toBe('5 minutes ago');
	});

	it('handles dates in the future', () => {
		const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
		expect(fromNow(inOneHour)).toContain('in');
	});
});
