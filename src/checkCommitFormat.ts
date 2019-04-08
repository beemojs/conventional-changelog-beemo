import { CommitType } from './types';

export default function checkCommitFormat(
  commit: string,
): null | { scope: string; type: CommitType } {
  const match = commit.match(
    /^(break|build|ci|docs|feature|fix|internal|misc|new|release|revert|security|style|test|update)(?:\(([a-zA-Z0-9\-.,]+)\))?:/u,
  );

  if (!match) {
    return null;
  }

  return {
    scope: match[2] || '',
    type: match[1] as CommitType,
  };
}
