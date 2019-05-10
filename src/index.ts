/**
 * @copyright   2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import checkCommitFormat from './checkCommitFormat';
import getTypeGroup, { GROUPS } from './getTypeGroup';
import conventionalChangelog from './conventionalChangelog';
import parserOpts from './parserOpts';
import recommendedBumpOpts from './recommendedBumpOpts';
import writerOpts from './writerOpts';

export { GROUPS, checkCommitFormat, getTypeGroup };

export * from './types';

export default Promise.resolve({
  conventionalChangelog,
  parserOpts,
  recommendedBumpOpts,
  writerOpts,
});
