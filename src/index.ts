/**
 * @copyright   2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { parserOpts } from './parserOpts';
import { writerOpts } from './writerOpts';
import { whatBump } from './whatBump';

export type * from './types';

export default function createPreset() {
	return {
		parser: parserOpts,
		writer: writerOpts,
		whatBump,
	};
}

// Compat with conventional-changelog-core < v8

export { parserOpts, writerOpts };
export const recommendedBumpOpts = { parserOpts, whatBump };
export const conventionalChangelog = { parserOpts, writerOpts };
