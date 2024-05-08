/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable sort-keys, no-param-reassign */

import fs from 'fs';
import path from 'path';
import { GROUPS } from './constants';
import { getTypeGroup } from './getTypeGroup';
import type { Context, Reference, WriterOptions } from './types';

const groupEmojis = Object.fromEntries(GROUPS.map((group) => [group.label, group.emoji]));

const sortWeights: Record<string, number> = {
	Release: 4,
	Breaking: 3,
	Updates: 2,
	Fixes: 1,
	Security: 0,
	Performance: -1,
	Styles: -1,
	Types: -2,
	Dependencies: -3,
	Docs: -4,
	Misc: -4,
	Reverts: -4,
	Internals: -5,
};

function createLink(paths: string[], context: Context, reference: Partial<Reference> = {}): string {
	const owner = reference.owner || context.owner;
	const repository = reference.repository || context.repository;
	const url: string[] = [];

	if (repository) {
		if (context.host) {
			url.push(context.host);
		}

		if (owner) {
			url.push(owner);
		}

		url.push(repository);
	} else if (context.repoUrl) {
		url.push(context.repoUrl);
	}

	let base = url.join('/');

	// If deep linking to a sub-folder (monorepo project, etc),
	// extract the base URL if possible.
	[
		// github, gitlab
		'tree',
		'blob',
		// bitbucket
		'src',
	].forEach((browsePart) => {
		if (base.includes(`/${browsePart}/`)) {
			[base] = base.split(`/${browsePart}/`);
		}
	});

	return [base, ...paths].join('/');
}

export const writerOpts: WriterOptions = {
	mainTemplate: fs.readFileSync(path.join(__dirname, '../templates/template.hbs'), 'utf8'),
	commitPartial: fs.readFileSync(path.join(__dirname, '../templates/commit.hbs'), 'utf8'),
	headerPartial: fs.readFileSync(path.join(__dirname, '../templates/header.hbs'), 'utf8'),
	footerPartial: fs.readFileSync(path.join(__dirname, '../templates/footer.hbs'), 'utf8'),

	// Commits
	groupBy: 'label',
	commitsSort: ['scope', 'message'],
	commitGroupsSort(groupA, groupB) {
		const aWeight = sortWeights[groupA.title] || 0;
		const bWeight = sortWeights[groupB.title] || 0;

		if (aWeight === 0 && bWeight === 0) {
			return groupA.title.localeCompare(groupB.title);
		}

		return bWeight - aWeight;
	},

	// Notes
	noteGroupsSort: 'title',

	// Add metadata
	transform(commit, context) {
		Object.assign(context, { groupEmojis });

		if (!commit.type) {
			return null;
		}

		// Use consistent values for snapshots
		if (process.env.NODE_ENV === 'test') {
			commit.hash = 'a1b2c3d';
			context.date = '2019-02-26';
		}

		// Override type for specific scenarios
		if (commit.revert) {
			commit.type = 'revert';
		} else if (commit.merge) {
			commit.type = 'misc';
		}

		// Define metadata based on type
		const group = getTypeGroup(commit.type);

		commit.label = group.label;

		if (group.bump === 'major') {
			Object.assign(context, { isMajor: true });
		} else if (group.bump === 'minor') {
			Object.assign(context, { isMinor: true });
		}

		// Use shorthand hashes
		if (typeof commit.hash === 'string') {
			// eslint-disable-next-line no-magic-numbers
			commit.hash = commit.hash.slice(0, 7);
		}

		// Pre-generate links instead of doing it in handlebars
		commit.hashLink = createLink([context.commit, commit.hash], context);

		commit.references.forEach((reference) => {
			reference.issueLink = createLink([context.issue, reference.issue], context, reference);

			let source = `${reference.repository || ''}#${reference.issue}`;

			if (reference.owner) {
				source = `${reference.owner}/${source}`;
			}

			reference.source = source;
		});

		// Link users
		if (context.host) {
			commit.message = commit.message.replace(
				// eslint-disable-next-line unicorn/no-unsafe-regex
				/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/gu,
				(match, username, index) => {
					if (
						String(username).includes('/') ||
						// Avoid when wrapped in backticks (inline code)
						commit.message.charAt(index - 1) === '`' ||
						commit.message.charAt(Number(index) + match.length + 1) === '`'
					) {
						return match;
					}

					return `[@${username}](${context.host}/${username})`;
				},
			);
		}

		return commit;
	},
};
