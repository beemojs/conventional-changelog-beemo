import { getTypeGroup } from './getTypeGroup';
import { parserOpts } from './parserOpts';
import { BumpOptions, Group, SemverLevel } from './types';

export const recommendedBumpOpts: BumpOptions = {
	parserOpts,

	whatBump(commits) {
		let level: SemverLevel = null;
		let breakings = 0;
		let features = 0;

		commits.forEach((commit) => {
			let group: Group;

			try {
				group = getTypeGroup(commit.type);
			} catch {
				return;
			}

			switch (group.bump) {
				case 'major': {
					breakings += 1;
					level = 0;

					break;
				}
				case 'minor': {
					features += 1;
					if (level === null || level === 2) {
						level = 1;
					}

					break;
				}
				case 'patch':
				default: {
					if (level === null) {
						level = 2;
					}

					break;
				}
			}
		});

		return {
			level,
			reason: `There are ${breakings} breaking changes and ${features} new features`,
		};
	},
};
