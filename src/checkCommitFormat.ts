import { COMMIT_FORMAT_PREFIX } from './constants';
import { CommitType } from './types';

export default function checkCommitFormat(
  commit: string,
): null | { scope: string; type: CommitType } {
  const match = commit.match(COMMIT_FORMAT_PREFIX);

  if (!match) {
    return null;
  }

  return {
    scope: match[2] || '',
    type: match[1] as CommitType,
  };
}
