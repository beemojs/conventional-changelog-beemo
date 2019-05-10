import { CommitType, Group } from './types';

export const GROUPS: Group[] = [
  {
    bump: 'major',
    emoji: '💥',
    label: 'Breaking',
    types: ['break'],
  },
  {
    bump: 'patch',
    emoji: '📦',
    label: 'Dependencies',
    types: ['deps'],
  },
  {
    emoji: '📘',
    label: 'Docs',
    types: ['docs'],
  },
  {
    bump: 'patch',
    emoji: '🐞',
    label: 'Fixes',
    types: ['fix'],
  },
  {
    emoji: '🛠',
    label: 'Internals',
    types: ['ci', 'build', 'test', 'internal'],
  },
  {
    bump: 'patch',
    emoji: '📋',
    label: 'Misc',
    types: ['misc'],
  },
  {
    bump: 'major',
    emoji: '🎉',
    label: 'Release',
    types: ['release'],
  },
  {
    bump: 'patch',
    emoji: '⚙️',
    label: 'Reverts',
    types: ['revert'],
  },
  {
    bump: 'patch',
    emoji: '🔑',
    label: 'Security',
    types: ['security'],
  },
  {
    bump: 'patch',
    emoji: '🎨',
    label: 'Styles',
    types: ['style'],
  },
  {
    bump: 'minor',
    emoji: '🚀',
    label: 'Updates',
    types: ['new', 'update', 'feature'],
  },
];

export default function getTypeGroup(type: CommitType): Group {
  const group = GROUPS.find(g => g.types.includes(type));

  if (!group) {
    throw new Error(`Cannot find group for type "${type}".`);
  }

  return group;
}
