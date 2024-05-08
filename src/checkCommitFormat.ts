import { COMMIT_FORMAT_PREFIX } from './constants';
import type { CommitType } from './types';

export function checkCommitFormat(
	commit: string,
): { breaking: boolean; scope: string; type: CommitType } | null {
	const match = commit.match(COMMIT_FORMAT_PREFIX);

	if (!match) {
		return null;
	}

	const type = match[1] as CommitType;

	return {
		breaking: !!match[3] || type === 'breaking' || type === 'break',
		scope: match[2] || '',
		type,
	};
}
