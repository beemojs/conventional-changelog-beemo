/* eslint-disable sort-keys, no-param-reassign */

import fs from 'fs';
import path from 'path';
import getTypeGroup from './getTypeGroup';
import { GROUPS } from './constants';
import { WriterOptions, CommitGroupLabel, Context, Reference } from './types';

type GroupMap<T> = { [K in CommitGroupLabel]: T };

const groupEmojis = GROUPS.reduce(
  (data, group) => ({
    ...data,
    [group.label]: group.emoji,
  }),
  {},
) as GroupMap<string>;

const sortWeights: GroupMap<number> = {
  Release: 4,
  Breaking: 3,
  Updates: 2,
  Fixes: 1,
  Security: 0,
  Styles: -1,
  Types: -1,
  Docs: -2,
  Dependencies: -3,
  Misc: -3,
  Reverts: -4,
  Internals: -5,
};

function createLink(paths: string[], context: Context, reference: Partial<Reference> = {}): string {
  const owner = reference.owner || context.owner;
  const repository = reference.repository || context.repository;
  const url: string[] = [];

  if (repository) {
    if (context.host) {
      url.push(context.host);
    }

    if (owner) {
      url.push(owner);
    }

    url.push(repository);
  } else {
    url.push(context.repoUrl);
  }

  url.push(...paths);

  return url.join('/');
}

const options: Partial<WriterOptions> = {
  mainTemplate: fs.readFileSync(path.join(__dirname, '../templates/template.hbs'), 'utf-8'),
  commitPartial: fs.readFileSync(path.join(__dirname, '../templates/commit.hbs'), 'utf-8'),
  headerPartial: fs.readFileSync(path.join(__dirname, '../templates/header.hbs'), 'utf-8'),
  footerPartial: fs.readFileSync(path.join(__dirname, '../templates/footer.hbs'), 'utf-8'),

  // Commits
  groupBy: 'label',
  commitsSort: ['scope', 'message'],
  commitGroupsSort(groupA, groupB) {
    const aWeight = sortWeights[groupA.title] || 0;
    const bWeight = sortWeights[groupB.title] || 0;

    if (aWeight === 0 && bWeight === 0) {
      return groupA.title.localeCompare(groupB.title);
    }

    return bWeight - aWeight;
  },

  // Notes
  noteGroupsSort: 'title',

  // Add metadata
  transform(commit, context) {
    context.groupEmojis = groupEmojis;

    if (!commit.type) {
      return undefined;
    }

    // Use consistent values for snapshots
    if (process.env.NODE_ENV === 'test') {
      commit.hash = 'a1b2c3d';
      context.date = '2019-02-26';
    }

    // Override type for specific scenarios
    if (commit.revert) {
      commit.type = 'revert';
    } else if (commit.merge) {
      commit.type = 'misc';
    }

    // Define metadata based on type
    const group = getTypeGroup(commit.type);

    commit.label = group.label;

    if (group.bump === 'major') {
      context.isMajor = true;
    } else if (group.bump === 'minor') {
      context.isMinor = true;
    }

    // Use shorthand hashes
    if (typeof commit.hash === 'string') {
      // eslint-disable-next-line no-magic-numbers
      commit.hash = commit.hash.slice(0, 7);
    }

    // Pre-generate links instead of doing it in handlebars
    commit.hashLink = createLink([context.commit, commit.hash], context);

    commit.references.forEach(reference => {
      reference.issueLink = createLink([context.issue, reference.issue], context, reference);

      let source = `${reference.repository || ''}#${reference.issue}`;

      if (reference.owner) {
        source = `${reference.owner}/${source}`;
      }

      reference.source = source;
    });

    // Link users
    if (context.host) {
      commit.message = commit.message.replace(
        /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/gu,
        (_, username) => {
          if (username.includes('/')) {
            return `@${username}`;
          }

          return `[@${username}](${context.host}/${username})`;
        },
      );
    }

    return commit;
  },
};

export default options;
