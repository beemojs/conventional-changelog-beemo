import path from 'path';
import Stream from 'stream';
// @ts-expect-error Not typed
import conventionalChangelogCore from 'conventional-changelog-core';
import { Bumper } from 'conventional-recommended-bump';
import shell from 'shelljs';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as config from '../src';
import { TestTools } from './utils';

function captureStreamOutput(stream: Stream.Readable) {
	return new Promise((resolve, reject) => {
		let data = '';

		stream
			.on('error', reject)
			.on('data', (chunk: string) => {
				data += String(chunk);
			})
			.on('end', () => {
				expect(data.trim()).toMatchSnapshot();
				resolve(undefined);
			});
	});
}

describe('conventional-changelog-beemo', () => {
	let utils: TestTools;

	const commonConfig = {
		config,
		pkg: {
			path: path.join(__dirname, 'package.json'),
		},
	};

	async function conventionalRecommendedBump(
		params: object,
		op: (error: Error | null, result: object) => void,
	) {
		const bumper = new Bumper(utils.cwd);

		try {
			// @ts-expect-error Ignore error
			op(null, await bumper.bump(params.config.whatBump));
		} catch (error) {
			op(error as Error, {});
		}
	}

	beforeEach(() => {
		utils = new TestTools();
		utils.gitInit();
	});

	afterEach(() => {
		utils.cleanup();
	});

	it('supports all types at once', () => {
		utils.gitCommit(['release: New major!', 'Note: New build system.']);
		utils.gitCommit(['break: Forms have changed', 'Note: They are easier now!']);
		utils.gitCommit(['new: amazing new module', 'Not backward compatible.']);
		utils.gitCommit('fix: updated i18n');
		utils.gitCommit(['update(modal, button): added accessibility', 'closes #1, #2']);
		utils.gitCommit('feature(core): settings refactor');
		utils.gitCommit('Random commit with no type');
		utils.gitCommit('docs: added getting started');
		utils.gitCommit('style(button): polished rounded corners');
		utils.gitCommit(['security(auth): improved logic', 'fixes #3']);
		utils.gitCommit('Revert PR #1');
		utils.gitCommit('ci(travis): fixed yaml config');
		utils.gitCommit('build(deps): updated dev tools');
		utils.gitCommit('test: setup testing framework');
		utils.gitCommit('internal(ts): updated types');
		utils.gitCommit('deps(babel,jest): Bumped to latest');
		utils.gitCommit(['patch(router): Fix params']);
		utils.gitCommit('types: Removed any');
		utils.gitCommit('perf: Speeeeed');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('works if there is no semver tag', () => {
		utils.gitCommit(['build: first build setup', 'Note: New build system.']);
		utils.gitCommit(['ci(travis): add TravisCI pipeline', 'Continuously integrated.']);
		utils.gitCommit(['new: amazing new module', 'Not backward compatible.']);
		utils.gitCommit(['fix(compile): avoid a bug', 'The Change is huge.']);
		utils.gitCommit(['update(ngOptions): make it faster', 'closes #1, #2']);
		utils.gitCommit('revert(ngOptions): bad commit');
		utils.gitCommit('fix(*): oops');
		utils.gitCommit('type: Added unknown');
		utils.gitCommit('tests: Added before hooks');
		utils.gitCommit('perf: Speeeeed');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('works if there is a semver tag', () => {
		shell.exec('git tag v1.0.0');
		utils.gitCommit('update: some more features');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
				outputUnreleased: true,
			}),
		);
	});

	it('works with unknown host', () => {
		utils.gitCommit('docs: add manual');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
				pkg: {
					path: path.join(__dirname, 'package-unknown-repo.json'),
				},
			}),
		);
	});

	it('uses h1 for major versions', () => {
		utils.gitCommit('break: new shit');
		utils.gitCommit('release: new stuff');
		utils.gitCommit('fix: just a patch');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('uses h2 for minor versions', () => {
		utils.gitCommit('new: new shit');
		utils.gitCommit('update: new stuff');
		utils.gitCommit('feature(modal): better modals');
		utils.gitCommit('fix: just a patch');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('uses h3 for patch versions', () => {
		utils.gitCommit('docs: add a manual');
		utils.gitCommit('patch: just a patch');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('replaces #[0-9]+ with issue URL', () => {
		utils.gitCommit(['new(awesome): fix #88']);

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('replaces @username with GitHub user URL', () => {
		utils.gitCommit(['feature(awesome): issue brought up by @bcoe! on Friday']);

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('doesnt replace @username if wrapped in backticks', () => {
		utils.gitCommit(['deps: Updated \\`@types\\` packages.']);

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('handles multiple notes', () => {
		utils.gitCommit(['release: Initial release', 'Note: Made a lot of changes']);
		utils.gitCommit(['fix(button): Made button changes', 'Note: Button is more buttony']);

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('links commits/issues to deep repositories correctly', () => {
		utils.gitCommit(['update: supports sub-package links', ' closes #10']);

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
				pkg: {
					path: path.join(__dirname, 'package-monorepo.json'),
				},
			}),
		);
	});

	it('supports non public GitHub repository locations', () => {
		utils.gitCommit(['update(events): implementing #5 by @dlmr', ' closes #10']);
		utils.gitCommit('new: why this work?');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
				pkg: {
					path: path.join(__dirname, 'package-custom-repo.json'),
				},
			}),
		);
	});

	it('only replaces with link to user if it is an username', () => {
		utils.gitCommit(['fix: use npm@5 (@username)']);
		utils.gitCommit([
			'build(deps): bump @dummy/package from 7.1.2 to 8.0.0',
			'break: The Change is huge.',
		]);

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('handles merge commits', () => {
		utils.gitCommit(['fix: use yarn']);
		utils.gitCommit('Merge pull request #29 from owner/repo');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	it('handles revert type', () => {
		utils.gitCommit('revert(foo): undo this');
		utils.gitCommit('Revert this is the PR title');

		return captureStreamOutput(
			conventionalChangelogCore({
				...commonConfig,
				cwd: utils.cwd,
			}),
		);
	});

	describe('recommended bump', () => {
		['break', 'breaking', 'release'].forEach((major) => {
			it.only(`bumps major version for ${major}`, () => {
				utils.gitCommit(`${major}: new stuff`);
				utils.gitCommit(`${major}(todo): with scope`);

				return conventionalRecommendedBump(
					{
						...commonConfig,
					},
					(error: Error | null, result: object) => {
						expect(error).toBeNull();
						expect(result).toEqual({
							level: 0,
							reason: 'There are 2 breaking changes and 0 new features',
							releaseType: 'major',
						});
					},
				);
			});
		});

		['new', 'update', 'feature'].forEach((minor) => {
			it.only(`bumps minor version for ${minor}`, () => {
				utils.gitCommit(`${minor}: new stuff`);
				utils.gitCommit(`${minor}(todo): with scope`);

				return conventionalRecommendedBump(
					{
						...commonConfig,
					},
					(error: Error | null, result: object) => {
						expect(error).toBeNull();
						expect(result).toEqual({
							level: 1,
							reason: 'There are 0 breaking changes and 2 new features',
							releaseType: 'minor',
						});
					},
				);
			});
		});

		[
			'fix',
			'deps',
			'style',
			'styles',
			'security',
			'revert',
			'misc',
			'type',
			'types',
			'perf',
		].forEach((patch) => {
			it.only(`bumps patch version for ${patch}`, () => {
				utils.gitCommit(`${patch}: new stuff`);
				utils.gitCommit(`${patch}(todo): with scope`);

				return conventionalRecommendedBump(
					{
						...commonConfig,
						ignoreReverted: false,
					},
					(error: Error | null, result: object) => {
						expect(error).toBeNull();
						expect(result).toEqual({
							level: 2,
							reason: 'There are 0 breaking changes and 0 new features',
							releaseType: 'patch',
						});
					},
				);
			});
		});

		['docs', 'ci', 'cd', 'build', 'test', 'tests', 'internal'].forEach((minor) => {
			it.only(`doesnt bump version for ${minor}`, () => {
				utils.gitCommit(`${minor}: new stuff`);
				utils.gitCommit(`${minor}(todo): with scope`);

				return conventionalRecommendedBump(
					{
						...commonConfig,
					},
					(error: Error | null, result: object) => {
						expect(error).toBeNull();
						expect(result).toEqual({
							level: undefined,
							reason: 'There are 0 breaking changes and 0 new features',
						});
					},
				);
			});
		});

		it.only('does nothing when no type exist', () => {
			utils.gitCommit('new stuff');
			utils.gitCommit('commit without a type');

			return conventionalRecommendedBump(
				{
					...commonConfig,
				},
				(error: Error | null, result: object) => {
					expect(error).toBeNull();
					expect(result).toEqual({
						level: undefined,
						reason: 'There are 0 breaking changes and 0 new features',
					});
				},
			);
		});
	});
});
