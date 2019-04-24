import { ParserOptions } from './types';

const options: Partial<ParserOptions> = {
  headerCorrespondence: ['type', 'scope', 'message'],
  // Keep in sync with checkCommitFormat
  headerPattern: /^(\w+)(?:\(([a-zA-Z0-9\-., ]+)\))?: (.*)$/u,
  mergeCorrespondence: ['pr', 'source'],
  mergePattern: /^Merged? pull request #(\d+) from (.*)/u,
  noteKeywords: 'Note',
  revertCorrespondence: [],
  revertPattern: /^Revert/u,
};

export default options;
