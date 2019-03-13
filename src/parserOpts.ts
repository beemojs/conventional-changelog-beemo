import { ParserOptions } from './types';

const options: Partial<ParserOptions> = {
  headerPattern: /^(\w+)(?:\(([a-z0-9\-\.]+)\))?: (.*)$/,
  headerCorrespondence: ['type', 'scope', 'message'],
  mergePattern: /^Merged? pull request #(\d+) from (.*)/,
  mergeCorrespondence: ['pr', 'source'],
  noteKeywords: 'Note',
  revertPattern: /^Revert|revert:/,
  revertCorrespondence: [],
};

export default options;
