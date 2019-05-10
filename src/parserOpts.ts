import { COMMIT_FORMAT_PREFIX } from './constants';
import { ParserOptions } from './types';

const options: Partial<ParserOptions> = {
  headerCorrespondence: ['type', 'scope', 'message'],
  // Keep in sync with checkCommitFormat
  headerPattern: new RegExp(`^${COMMIT_FORMAT_PREFIX.source} (.*)$`, 'u'),
  mergeCorrespondence: ['pr', 'source'],
  mergePattern: /^Merged? pull request #(\d+) from (.*)/u,
  noteKeywords: 'Note',
  revertCorrespondence: [],
  revertPattern: /^Revert/u,
};

export default options;
