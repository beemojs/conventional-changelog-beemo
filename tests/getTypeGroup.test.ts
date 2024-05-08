import { describe, it, expect } from 'vitest';
import { getTypeGroup } from '../src/getTypeGroup';

describe('getTypeGroup()', () => {
	it('returns the group by type', () => {
		expect(getTypeGroup('new')).toEqual({
			bump: 'minor',
			emoji: '🚀',
			label: 'Updates',
			types: ['new', 'update', 'feature'],
		});
	});

	it('errors for invalid type', () => {
		expect(() => {
			// @ts-expect-error Invalid type
			getTypeGroup('unknown');
		}).toThrowErrorMatchingSnapshot();
	});
});
