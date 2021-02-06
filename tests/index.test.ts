/* eslint-disable jest/expect-expect, jest/no-done-callback */

import path from 'path';
import Stream from 'stream';
import conventionalChangelogCore from 'conventional-changelog-core';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import shell from 'shelljs';
import { config } from '../src';

function gitDummyCommit(msg: string[] | string, silent: boolean = true) {
  const args: string[] = ['--allow-empty', '--no-gpg-sign'];

  if (Array.isArray(msg)) {
    msg.forEach((m) => {
      args.push(`-m"${m}"`);
    });
  } else {
    args.push(`-m"${msg}"`);
  }

  shell.exec(`git commit ${args.join(' ')}`, { silent });
}

function captureStreamOutput(stream: Stream.Readable, done: jest.DoneCallback) {
  let data = '';

  stream
    .on('error', (error: Error) => {
      done.fail(error);
    })
    .on('data', (chunk: string) => {
      data += String(chunk);
    })
    .on('end', () => {
      expect(data.trim()).toMatchSnapshot();
      done();
    });
}

describe('conventional-changelog-beemo', () => {
  const commonConfig = {
    config,
    pkg: {
      path: path.join(__dirname, 'package.json'),
    },
  };

  beforeEach(() => {
    (shell.config as any).resetForTesting();
    shell.cd(__dirname);
    shell.mkdir('tmp');
    shell.cd('tmp');
    shell.mkdir('git-templates');
    shell.exec('git init --template=./git-templates');
  });

  afterEach(() => {
    shell.cd(__dirname);
    shell.rm('-rf', 'tmp');
  });

  it('supports all types at once', (done) => {
    gitDummyCommit(['release: New major!', 'Note: New build system.']);
    gitDummyCommit(['break: Forms have changed', 'Note: They are easier now!']);
    gitDummyCommit(['new: amazing new module', 'Not backward compatible.']);
    gitDummyCommit('fix: updated i18n');
    gitDummyCommit(['update(modal, button): added accessibility', 'closes #1, #2']);
    gitDummyCommit('feature(core): settings refactor');
    gitDummyCommit('Random commit with no type');
    gitDummyCommit('docs: added getting started');
    gitDummyCommit('style(button): polished rounded corners');
    gitDummyCommit(['security(auth): improved logic', 'fixes #3']);
    gitDummyCommit('Revert PR #1');
    gitDummyCommit('ci(travis): fixed yaml config');
    gitDummyCommit('build(deps): updated dev tools');
    gitDummyCommit('test: setup testing framework');
    gitDummyCommit('internal(ts): updated types');
    gitDummyCommit('deps(babel,jest): Bumped to latest');
    gitDummyCommit(['patch(router): Fix params']);
    gitDummyCommit('types: Removed any');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('works if there is no semver tag', (done) => {
    gitDummyCommit(['build: first build setup', 'Note: New build system.']);
    gitDummyCommit(['ci(travis): add TravisCI pipeline', 'Continuously integrated.']);
    gitDummyCommit(['new: amazing new module', 'Not backward compatible.']);
    gitDummyCommit(['fix(compile): avoid a bug', 'The Change is huge.']);
    gitDummyCommit(['update(ngOptions): make it faster', 'closes #1, #2']);
    gitDummyCommit('revert(ngOptions): bad commit');
    gitDummyCommit('fix(*): oops');
    gitDummyCommit('type: Added unknown');
    gitDummyCommit('tests: Added before hooks');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('works if there is a semver tag', (done) => {
    shell.exec('git tag v1.0.0');
    gitDummyCommit('update: some more features');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
        outputUnreleased: true,
      }),
      done,
    );
  });

  it('works with unknown host', (done) => {
    gitDummyCommit('docs: add manual');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
        pkg: {
          path: path.join(__dirname, 'package-unknown-repo.json'),
        },
      }),
      done,
    );
  });

  it('uses h1 for major versions', (done) => {
    gitDummyCommit('break: new shit');
    gitDummyCommit('release: new stuff');
    gitDummyCommit('fix: just a patch');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('uses h2 for minor versions', (done) => {
    gitDummyCommit('new: new shit');
    gitDummyCommit('update: new stuff');
    gitDummyCommit('feature(modal): better modals');
    gitDummyCommit('fix: just a patch');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('uses h3 for patch versions', (done) => {
    gitDummyCommit('docs: add a manual');
    gitDummyCommit('patch: just a patch');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('replaces #[0-9]+ with issue URL', (done) => {
    gitDummyCommit(['new(awesome): fix #88']);

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('replaces @username with GitHub user URL', (done) => {
    gitDummyCommit(['feature(awesome): issue brought up by @bcoe! on Friday']);

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('doesnt replace @username if wrapped in backticks', (done) => {
    gitDummyCommit(['deps: Updated \\`@types\\` packages.']);

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('handles multiple notes', (done) => {
    gitDummyCommit(['release: Initial release', 'Note: Made a lot of changes']);
    gitDummyCommit(['fix(button): Made button changes', 'Note: Button is more buttony']);

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('links commits/issues to deep repositories correctly', (done) => {
    gitDummyCommit(['update: supports sub-package links', ' closes #10']);

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
        pkg: {
          path: path.join(__dirname, 'package-monorepo.json'),
        },
      }),
      done,
    );
  });

  it('supports non public GitHub repository locations', (done) => {
    gitDummyCommit(['update(events): implementing #5 by @dlmr', ' closes #10']);
    gitDummyCommit('new: why this work?');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
        pkg: {
          path: path.join(__dirname, 'package-custom-repo.json'),
        },
      }),
      done,
    );
  });

  it('only replaces with link to user if it is an username', (done) => {
    gitDummyCommit(['fix: use npm@5 (@username)']);
    gitDummyCommit([
      'build(deps): bump @dummy/package from 7.1.2 to 8.0.0',
      'break: The Change is huge.',
    ]);

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('handles merge commits', (done) => {
    gitDummyCommit(['fix: use yarn']);
    gitDummyCommit('Merge pull request #29 from owner/repo');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  it('handles revert type', (done) => {
    gitDummyCommit('revert(foo): undo this');
    gitDummyCommit('Revert this is the PR title');

    captureStreamOutput(
      conventionalChangelogCore({
        ...commonConfig,
      }),
      done,
    );
  });

  describe('recommended bump', () => {
    ['break', 'breaking', 'release'].forEach((major) => {
      it(`bumps major version for ${major}`, (done) => {
        gitDummyCommit(`${major}: new stuff`);
        gitDummyCommit(`${major}(todo): with scope`);

        conventionalRecommendedBump(
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
            done();
          },
        );
      });
    });

    ['new', 'update', 'feature'].forEach((minor) => {
      it(`bumps minor version for ${minor}`, (done) => {
        gitDummyCommit(`${minor}: new stuff`);
        gitDummyCommit(`${minor}(todo): with scope`);

        conventionalRecommendedBump(
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
            done();
          },
        );
      });
    });

    ['fix', 'deps', 'style', 'styles', 'security', 'revert', 'misc', 'type', 'types'].forEach(
      (patch) => {
        it(`bumps patch version for ${patch}`, (done) => {
          gitDummyCommit(`${patch}: new stuff`);
          gitDummyCommit(`${patch}(todo): with scope`);

          conventionalRecommendedBump(
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
              done();
            },
          );
        });
      },
    );

    ['docs', 'ci', 'cd', 'build', 'test', 'tests', 'internal'].forEach((minor) => {
      it(`doesnt bump version for ${minor}`, (done) => {
        gitDummyCommit(`${minor}: new stuff`);
        gitDummyCommit(`${minor}(todo): with scope`);

        conventionalRecommendedBump(
          {
            ...commonConfig,
          },
          (error: Error | null, result: object) => {
            expect(error).toBeNull();
            expect(result).toEqual({
              level: null,
              reason: 'There are 0 breaking changes and 0 new features',
            });
            done();
          },
        );
      });
    });

    it('does nothing when no type exist', (done) => {
      gitDummyCommit('new stuff');
      gitDummyCommit('commit without a type');

      conventionalRecommendedBump(
        {
          ...commonConfig,
        },
        (error: Error | null, result: object) => {
          expect(error).toBeNull();
          expect(result).toEqual({
            level: null,
            reason: 'There are 0 breaking changes and 0 new features',
          });
          done();
        },
      );
    });
  });
});
