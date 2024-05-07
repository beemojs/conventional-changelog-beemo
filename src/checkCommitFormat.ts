import { COMMIT_FORMAT_PREFIX } from './constants';
import type { CommitType } from './types';

export function checkCommitFormat(commit: string): { scope: string; type: CommitType } | null {
	const match = commit.match(COMMIT_FORMAT_PREFIX);

	if (!match) {
		return null;
	}

	return {
		scope: match[2] || '',
		type: match[1] as CommitType,
	};
}
