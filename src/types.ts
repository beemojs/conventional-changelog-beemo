export interface Note {
	title: string;
	text: string;
}

export interface Reference {
	action: string;
	owner: string | null;
	repository: string | null;
	issue: string;
	raw: string;
	prefix: string;
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

export interface Commit {
	body: string | null;
	footer: string | null;
	header: string;
	mentions: string[];
	merge: string | null;
	notes: Note[];
	references: Reference[];
	revert: Record<string, string> | null;
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

export interface Context {
	commit: string;
	date: string;
	host: string;
	isPatch: boolean;
	isMinor: boolean;
	isMajor: boolean;
	issue: string;
	linkReferences: boolean;
	options: Record<string, unknown>;
	owner: string;
	repository: string;
	repoUrl: string;
	title: string;
	version: string;
	// Beemo
	headerLevel?: '#' | '##' | '###';
	groupEmojis?: { [K in CommitGroupLabel]: string };
}

export type Pattern = RegExp | string | null;

export type Correspondence = string[] | string;

export type Sorter<T> = string[] | string | ((a: T, b: T) => number);

export interface ParserOptions {
	fieldPattern: Pattern;
	headerPattern: Pattern;
	headerCorrespondence: Correspondence;
	issuePrefixes: string[] | string;
	mergePattern: Pattern;
	mergeCorrespondence: Correspondence;
	noteKeywords: string[] | string;
	referenceActions: string[] | string | null;
	revertPattern: Pattern;
	revertCorrespondence: Correspondence;
	warn: boolean | (() => void);
}

export interface WriterOptions {
	commitGroupsSort: Sorter<{
		title: CommitGroupLabel;
		commits: Commit[];
	}>;
	commitPartial: string;
	commitsSort: Sorter<Commit>;
	debug: () => void;
	doFlush: boolean;
	finalizeContext:
		| ((context: Context, options: WriterOptions, commits: Commit[], keyCommit: Commit) => Context)
		| undefined;
	footerPartial: string;
	generateOn:
		| string
		| ((commit: Commit, commits: Commit[], context: Context, options: WriterOptions) => unknown);
	groupBy: string;
	headerPartial: string;
	ignoreReverted: boolean;
	includeDetails: boolean;
	mainTemplate: string;
	noteGroupsSort: Sorter<{
		title: string;
		notes: Note[];
	}>;
	notesSort: Sorter<Note>;
	partials: Record<string, unknown>;
	reverse: boolean;
	transform: (commit: Commit, context: Context) => Commit | undefined;
}

export type SemverLevel = 0 | 1 | 2 | null; // major | minor | patch

export interface BumpOptions {
	parserOpts: Partial<ParserOptions>;
	whatBump: (commits: Commit[]) => { level: SemverLevel; reason: string };
}
