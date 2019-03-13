/* eslint-disable jest/expect-expect */

import Stream from 'stream';
import conventionalChangelogCore from 'conventional-changelog-core';
import gitDummyCommit from 'git-dummy-commit';
import shell from 'shelljs';
import preset from '../src';

describe('conventional-changelog-beemo', () => {
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

  it('supports all types at once', done => {
    gitDummyCommit(['release: New major!', 'Note: New build system.']);
    gitDummyCommit(['break: Forms have changed', 'Note: They are easier now!']);
    gitDummyCommit(['new: amazing new module', 'Not backward compatible.']);
    gitDummyCommit('fix: updated i18n');
    gitDummyCommit(['update(modal): added accessibility', 'closes #1, #2']);
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

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('works if there is no semver tag', done => {
    gitDummyCommit(['build: first build setup', 'Note: New build system.']);
    gitDummyCommit(['ci(travis): add TravisCI pipeline', 'Continuously integrated.']);
    gitDummyCommit(['new: amazing new module', 'Not backward compatible.']);
    gitDummyCommit(['fix(compile): avoid a bug', 'The Change is huge.']);
    gitDummyCommit(['update(ngOptions): make it faster', 'closes #1, #2']);
    gitDummyCommit('revert(ngOptions): bad commit');
    gitDummyCommit('fix(*): oops');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('works if there is a semver tag', done => {
    shell.exec('git tag v1.0.0');
    gitDummyCommit('update: some more features');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
        outputUnreleased: true,
      }),
      done,
    );
  });

  it('works with unknown host', done => {
    gitDummyCommit('docs: add manual');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
        pkg: {
          repository: 'unknown',
          version: 'v2.0.0',
        },
      }),
      done,
    );
  });

  it('uses h1 for major versions', done => {
    gitDummyCommit('break: new shit');
    gitDummyCommit('release: new stuff');
    gitDummyCommit('fix: just a patch');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('uses h2 for minor versions', done => {
    gitDummyCommit('new: new shit');
    gitDummyCommit('update: new stuff');
    gitDummyCommit('feature(modal): better modals');
    gitDummyCommit('fix: just a patch');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('uses h3 for patch versions', done => {
    gitDummyCommit('docs: add a manual');
    gitDummyCommit('fix: just a patch');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('replaces #[0-9]+ with issue URL', done => {
    gitDummyCommit(['new(awesome): fix #88']);

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('replaces @username with GitHub user URL', done => {
    gitDummyCommit(['feature(awesome): issue brought up by @bcoe! on Friday']);

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('handles multiple notes', done => {
    gitDummyCommit(['release: Initial release', 'Note: Made a lot of changes']);
    gitDummyCommit(['fix(button): Made button changes', 'Note: Button is more buttony']);

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('supports non public GitHub repository locations', done => {
    gitDummyCommit(['update(events): implementing #5 by @dlmr', ' closes #10']);
    gitDummyCommit('new: why this work?');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
        pkg: {
          version: 'v3.0.0',
          repository: 'https://github.internal.example.com/conventional-changelog/internal',
        },
      }),
      done,
    );
  });

  it('only replaces with link to user if it is an username', done => {
    gitDummyCommit(['fix: use npm@5 (@username)']);
    gitDummyCommit([
      'build(deps): bump @dummy/package from 7.1.2 to 8.0.0',
      'break: The Change is huge.',
    ]);

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('handles merge commits', done => {
    gitDummyCommit(['fix: use yarn']);
    gitDummyCommit('Merge pull request #29 from owner/repo');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });

  it('handles revert type', done => {
    gitDummyCommit('revert(foo): undo this');
    gitDummyCommit('Revert this is the PR title');

    captureStreamOutput(
      conventionalChangelogCore({
        config: preset,
      }),
      done,
    );
  });
});
