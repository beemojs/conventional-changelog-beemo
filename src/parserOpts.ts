import { ParserOptions } from './types';

const options: Partial<ParserOptions> = {
  headerCorrespondence: ['type', 'scope', 'message'],
  headerPattern: /^(\w+)(?:\(([a-z0-9\-.,]+)\))?: (.*)$/u,
  mergeCorrespondence: ['pr', 'source'],
  mergePattern: /^Merged? pull request #(\d+) from (.*)/u,
  noteKeywords: 'Note',
  revertCorrespondence: [],
  revertPattern: /^Revert|revert:/u,
};

export default options;
