import fs from 'fs';
import path from 'path';
import { WriterOptions, Context, Reference } from './types';

const groupEmojis = {
  Breaking: '💥',
  Release: '🎉',
  Updates: '🚀',
  Fixes: '🐞',
  Docs: '📘',
  Styles: '🎨',
  Security: '🔑',
  Reverts: '⚙️',
  Internals: '🛠',
  Misc: '',
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
    // Always first
    if (groupB.title === 'Breaking' || groupB.title === 'Release') {
      return 3;
    }

    // Always 2nd
    if (groupB.title === 'Updates') {
      return 2;
    }

    // Always 2nd to last
    if (groupB.title === 'Misc') {
      return -2;
    }

    // Always last
    if (groupB.title === 'Internals') {
      return -3;
    }

    return groupA.title.localeCompare(groupB.title);
  },

  // Notes
  noteGroupsSort: 'title',

  // Add metadata
  transform(commit, context) {
    context.groupEmojis = groupEmojis;

    if (!commit.type) {
      return;
    }

    // Use consistent values for snapshots
    if (process.env.NODE_ENV === 'test') {
      commit.hash = 'a1b2c3d';
      context.date = '2019-02-26';
    }

    if (commit.type === 'break') {
      commit.label = 'Breaking';
    } else if (commit.type === 'release') {
      commit.label = 'Release';
    } else if (commit.type === 'new' || commit.type === 'update' || commit.type === 'feature') {
      commit.label = 'Updates';
    } else if (commit.type === 'fix') {
      commit.label = 'Fixes';
    } else if (commit.type === 'docs') {
      commit.label = 'Docs';
    } else if (commit.type === 'style') {
      commit.label = 'Styles';
    } else if (commit.type === 'security') {
      commit.label = 'Security';
    } else if (commit.type === 'revert') {
      commit.label = 'Reverts';
    } else if (
      commit.type === 'ci' ||
      commit.type === 'build' ||
      commit.type === 'test' ||
      commit.type === 'internal'
    ) {
      commit.label = 'Internals';
    } else {
      commit.label = 'Misc';
    }

    if (commit.type === 'break' || commit.type === 'release') {
      context.isMajor = true;
    } else if (commit.type === 'new' || commit.type === 'update' || commit.type === 'feature') {
      context.isMinor = true;
    }

    if (typeof commit.hash === 'string') {
      commit.hash = commit.hash.substring(0, 7);
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
        /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
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
