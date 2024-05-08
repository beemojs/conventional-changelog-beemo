// Copied from https://github.com/conventional-changelog/conventional-changelog/blob/master/tools/TestTools.ts

import { execSync, spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';

export function createTmpDirectory() {
	const id = randomUUID();
	const dirname = path.join(os.tmpdir(), 'cc-beemo', id);

	fs.mkdirSync(dirname, {
		recursive: true,
	});

	return dirname;
}

function fixMessage(message?: string) {
	let msg = message;

	if (!msg || typeof msg !== 'string') {
		msg = 'Test commit';
	}

	// we need to escape backtick for bash but not for windows
	// probably this should be done in git-dummy-commit or shelljs
	if (process.platform !== 'win32') {
		msg = msg.replace(/`/g, '\\`');
	}

	return `"${msg}"`;
}

function formatMessageArgs(msg: string | string[]) {
	const args = [];

	if (Array.isArray(msg)) {
		if (msg.length > 0) {
			for (const m of msg) {
				args.push('-m', fixMessage(m));
			}
		} else {
			args.push('-m', fixMessage());
		}
	} else {
		args.push('-m', fixMessage(msg));
	}

	return args;
}

export class TestTools {
	cwd: string;
	private readonly shouldCleanup: boolean;

	constructor(cwd?: string) {
		if (cwd) {
			this.cwd = cwd;
			this.shouldCleanup = false;
		} else {
			this.cwd = createTmpDirectory();
			this.shouldCleanup = true;
		}
	}

	cleanup() {
		if (!this.shouldCleanup) {
			return;
		}

		try {
			this.rmSync(this.cwd, {
				recursive: true,
			});
		} catch (err) {
			// ignore
		}
	}

	mkdirSync(dir: string, options?: Parameters<typeof fs.mkdirSync>[1]) {
		return fs.mkdirSync(path.resolve(this.cwd, dir), options);
	}

	writeFileSync(file: string, content: string) {
		return fs.writeFileSync(path.resolve(this.cwd, file), content);
	}

	readFileSync(file: string, options: Parameters<typeof fs.readFileSync>[1]) {
		return fs.readFileSync(path.resolve(this.cwd, file), options);
	}

	rmSync(target: string, options?: Parameters<typeof fs.rmSync>[1]) {
		return fs.rmSync(path.resolve(this.cwd, target), options);
	}

	exec(command: string) {
		return execSync(command, {
			cwd: this.cwd,
			stdio: 'pipe',
			encoding: 'utf-8',
		});
	}

	fork(script: string, args: string[] = [], options: Parameters<typeof spawn>[2] = {}) {
		return new Promise<{ stdout: string; stderr: string; exitCode: number | null }>(
			(resolve, reject) => {
				const finalOptions = {
					cwd: this.cwd,
					stdio: [null, null, null],
					...options,
				};
				const nodeArgs = [
					'--no-warnings',
					'--loader',
					pathToFileURL(
						path.resolve(__dirname, '..', 'node_modules', 'tsm', 'loader.mjs'),
					).toString(),
				];
				const child = spawn(process.execPath, [...nodeArgs, script, ...args], finalOptions);
				let stdout = '';
				let stderr = '';
				let exitCode = null;

				child.stdout?.on('data', (data: Buffer) => {
					stdout += data.toString();
				});
				child.stderr?.on('data', (data: Buffer) => {
					stderr += data.toString();
				});
				child.on('close', (code) => {
					exitCode = code;
					resolve({
						stdout,
						stderr,
						exitCode,
					});
				});
				child.on('error', reject);
			},
		);
	}

	gitInit() {
		this.mkdirSync('git-templates');
		return this.exec('git init --template=./git-templates  --initial-branch=master');
	}

	gitInitSimpleRepository() {
		this.gitInit();

		for (let i = 0; i < 20; i++) {
			this.gitCommit(`Test commit ${i}`);

			if (i % 3 === 0) {
				this.exec(`git tag v${i}.0.0`);
			}
		}
	}

	gitCommit(msg: string | string[]) {
		const args = formatMessageArgs(msg);

		args.push('--allow-empty', '--no-gpg-sign');

		return this.exec(`git commit ${args.join(' ')}`);
	}

	gitTails() {
		const data = execSync('git rev-list --parents HEAD', {
			cwd: this.cwd,
		});

		return data.toString().match(/^[a-f0-9]{40}$/gm);
	}
}
