import fs from 'fs';
import path from 'path';
import { WriterOptions, Context, Reference } from './types';

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
    // Always top
    if (groupB.title === 'Breaking' || groupB.title === 'Release') {
      return 2;
    }

    // Always bottom
    if (groupB.title === 'Internals') {
      return -2;
    }

    return groupA.title.localeCompare(groupB.title);
  },

  // Notes
  noteGroupsSort: 'title',

  // Add metadata
  transform(commit, context) {
    if (!commit.type || !commit.pr) {
      return;
    }

    if (commit.type === 'break' || commit.type === 'release') {
      context.isMajor = true;
    } else if (commit.type === 'new' || commit.type === 'update' || commit.type === 'feature') {
      context.isMinor = true;
    }

    if (typeof commit.hash === 'string') {
      commit.hash = commit.hash.substring(0, 7);
    }

    commit.hashLink = createLink([context.commit, commit.hash], context);

    if (commit.references) {
      commit.references.forEach(reference => {
        reference.issueLink = createLink([context.issue, reference.issue], context, reference);

        let source = `${reference.repository || ''}#${reference.issue}`;

        if (reference.owner) {
          source = `${reference.owner}/${source}`;
        }

        reference.source = source;
      });
    }

    return commit;
  },
};

export default options;
