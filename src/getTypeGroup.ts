import { GROUPS } from './constants';
import type { CommitType, Group } from './types';

export function getTypeGroup(type: CommitType): Group {
	const group = GROUPS.find((g) => g.types.includes(type));

	if (!group) {
		throw new Error(`Cannot find group for type "${type}".`);
	}

	return group;
}
