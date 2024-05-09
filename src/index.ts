/**
 * @copyright   2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { parserOpts } from './parserOpts';
import { writerOpts } from './writerOpts';
import { whatBump } from './whatBump';

export * from './types';

export default function createPreset() {
	return {
		parser: parserOpts,
		writer: writerOpts,
		whatBump,
	};
}
