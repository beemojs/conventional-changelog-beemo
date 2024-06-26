import { COMMIT_FORMAT_PREFIX } from './constants';
import type { ParserOptions } from './types';

export const parserOpts: ParserOptions = {
	headerCorrespondence: ['type', 'scope', 'breaking', 'message'],
	// Keep in sync with checkCommitFormat
	headerPattern: new RegExp(`^${COMMIT_FORMAT_PREFIX.source} (.*)$`, 'u'),
	mergeCorrespondence: ['pr', 'source'],
	mergePattern: /^Merged? pull request #(\d+) from (.*)/u,
	noteKeywords: ['Note'],
	revertCorrespondence: [],
	revertPattern: /^Revert/u,
};
