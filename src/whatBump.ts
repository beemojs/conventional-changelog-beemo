import type { BumperRecommendation } from 'conventional-recommended-bump';
import { getTypeGroup } from './getTypeGroup';
import type { Commit, CommitType, Group } from './types';

// 0 - major | 1 - minor | 2 - patch
export async function whatBump(commits: Commit[]): Promise<BumperRecommendation> {
	let level: number | undefined = undefined;
	let breakings = 0;
	let features = 0;

	commits.forEach((commit) => {
		let group: Group;

		try {
			if (commit.type) {
				group = getTypeGroup(commit.type as CommitType);
			} else {
				return;
			}
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
			case 'patch': {
				if (level === null) {
					level = 2;
				}

				break;
			}
			default:
				break;
		}
	});

	return {
		level,
		reason: `There are ${breakings} breaking changes and ${features} new features`,
	};
}
