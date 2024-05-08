/**
 * @copyright   2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { parserOpts } from './parserOpts';
import { writerOpts } from './writerOpts';
import { whatBump } from './whatBump';

export { checkCommitFormat } from './checkCommitFormat';
export * from './constants';
export { getTypeGroup } from './getTypeGroup';
export * from './types';

export { parserOpts, writerOpts, whatBump };

export default function createPreset() {
	return {
		parser: parserOpts,
		writer: writerOpts,
		whatBump,
	};
}
