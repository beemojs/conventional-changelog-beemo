/**
 * @copyright   2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import conventionalChangelog from './conventionalChangelog';
import parserOpts from './parserOpts';
import recommendedBumpOpts from './recommendedBumpOpts';
import writerOpts from './writerOpts';

export default Promise.resolve({
  conventionalChangelog,
  parserOpts,
  recommendedBumpOpts,
  writerOpts,
});
