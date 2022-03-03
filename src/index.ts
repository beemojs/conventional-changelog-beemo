/**
 * @copyright   2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { checkCommitFormat } from './checkCommitFormat';
import { conventionalChangelog } from './conventionalChangelog';
import { getTypeGroup } from './getTypeGroup';
import { parserOpts } from './parserOpts';
import { recommendedBumpOpts } from './recommendedBumpOpts';
import { writerOpts } from './writerOpts';

export { checkCommitFormat, getTypeGroup };

export * from './constants';
export * from './types';

export const config = Promise.resolve({
	conventionalChangelog,
	parserOpts,
	recommendedBumpOpts,
	writerOpts,
});
