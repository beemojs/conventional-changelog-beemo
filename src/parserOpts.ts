import { ParserOptions } from './types';

const options: Partial<ParserOptions> = {
  headerPattern: /^(\w+)(?:\(([a-z0-9\-\.]+)\))?: (.*)$/,
  headerCorrespondence: ['type', 'scope', 'message'],
  mergePattern: /^Merged? pull request #(\d+) from (.*)/,
  mergeCorrespondence: ['pr', 'source'],
  noteKeywords: 'Note',
  revertPattern: /^revert:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
  revertCorrespondence: ['header', 'hash'],
};

export default options;
