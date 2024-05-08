import type { CommitBase, CommitReference } from 'conventional-commits-parser';
import type {
	Context as ContextBase,
	TemplatesOptions,
	Options as WriterOptionsBase,
} from 'conventional-changelog-writer';

export type { ParserOptions } from 'conventional-commits-parser';

export interface Reference extends CommitReference {
	// Beemo
	issueLink: string;
	source: string;
}

export type CommitType =
	| 'break'
	| 'breaking'
	| 'build'
	| 'cd'
	| 'chore'
	| 'ci'
	| 'deps'
	| 'docs'
	| 'feature'
	| 'fix'
	| 'internal'
	| 'misc'
	| 'new'
	| 'patch'
	| 'perf'
	| 'release'
	| 'revert'
	| 'security'
	| 'style'
	| 'styles'
	| 'test'
	| 'tests'
	| 'type'
	| 'types'
	| 'update';

export type CommitGroupLabel =
	| 'Breaking'
	| 'Dependencies'
	| 'Docs'
	| 'Fixes'
	| 'Internals'
	| 'Misc'
	| 'Performance'
	| 'Release'
	| 'Reverts'
	| 'Security'
	| 'Styles'
	| 'Types'
	| 'Updates';

export interface Group {
	bump?: 'major' | 'minor' | 'patch';
	emoji: string;
	label: CommitGroupLabel;
	types: CommitType[];
}

export interface Commit extends CommitBase {
	references: Reference[];
	// Beemo
	hash: string;
	hashLink: string;
	label: CommitGroupLabel;
	message: string;
	pr: string;
	scope: string;
	source: string;
	type: CommitType;
}

export interface Context extends ContextBase<Commit> {
	groupEmojis?: { [K in CommitGroupLabel]: string };
	headerLevel?: '#' | '##' | '###';
	isMinor?: boolean;
	isMajor?: boolean;
	options?: Record<string, unknown>;
}

export interface WriterOptions extends WriterOptionsBase<Commit>, TemplatesOptions {
	includeDetails?: boolean;
}
