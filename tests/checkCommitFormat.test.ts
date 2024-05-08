import { describe, it, expect } from 'vitest';
import { checkCommitFormat } from '../src/checkCommitFormat';

describe('checkCommitFormat()', () => {
	it('returns null when no match', () => {
		expect(checkCommitFormat('Random string')).toBeNull();
		expect(checkCommitFormat('type')).toBeNull();
		expect(checkCommitFormat('bad: Invalid type')).toBeNull();
		expect(checkCommitFormat('new Missing colon')).toBeNull();
	});

	it('returns the type without scope', () => {
		expect(checkCommitFormat('new: Added something')).toEqual({
			breaking: false,
			type: 'new',
			scope: '',
		});
	});

	it('returns the type and scope', () => {
		expect(checkCommitFormat('update(foo): Updated something')).toEqual({
			breaking: false,
			type: 'update',
			scope: 'foo',
		});
	});

	it('supports dashes and numbers', () => {
		expect(checkCommitFormat('fix(foo-123): Did something')).toEqual({
			breaking: false,
			type: 'fix',
			scope: 'foo-123',
		});
	});

	it('supports comma separated', () => {
		expect(checkCommitFormat('ci(foo,bar): Did something')).toEqual({
			breaking: false,
			type: 'ci',
			scope: 'foo,bar',
		});
	});

	it('supports upper case scopes', () => {
		expect(checkCommitFormat('ci(FooBar): Did something')).toEqual({
			breaking: false,
			type: 'ci',
			scope: 'FooBar',
		});
	});

	it('supports spaces', () => {
		expect(checkCommitFormat('ci(Foo, Bar Baz): Did something')).toEqual({
			breaking: false,
			type: 'ci',
			scope: 'Foo, Bar Baz',
		});
	});

	it('breaking type', () => {
		expect(checkCommitFormat('break: Did something')).toEqual({
			breaking: true,
			type: 'break',
			scope: '',
		});
	});

	it('breaking via exclamation', () => {
		expect(checkCommitFormat('new!: Did something')).toEqual({
			breaking: true,
			type: 'new',
			scope: '',
		});
	});

	it('breaking via exclamation with scope', () => {
		expect(checkCommitFormat('new(foo)!: Did something')).toEqual({
			breaking: true,
			type: 'new',
			scope: 'foo',
		});
	});
});
