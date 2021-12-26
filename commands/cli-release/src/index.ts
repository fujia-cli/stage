import path from 'path';
import fs from 'fs';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';
import { getInfoFromPkgJson, getLatestVersion } from '@fujia/get-pkg-info';
import simpleGit, { SimpleGit } from 'simple-git';
import { spawn, NewEnvVariables, spawnAsync, readDotFileToObj } from '@fujia/cli-utils';
import { inquireUpgradeVersionType } from './inquirer-prompt';

import { NPM_REGISTRY } from './constants';

export class ReleaseCommand extends CliCommand {
	branch: string;
	git: SimpleGit;
	pkgInfo: {
		packageName: string;
		version: string;
		[key: string]: string;
	} | null;
	constructor(args: any[]) {
		super(args);
		this.git = simpleGit();
		this.pkgInfo = null;
		this.branch = 'main';
	}

	init() {
		log.verbose('[cli-release]', `init`);
	}

	async exec() {
		try {
			await this.prepare();
			await this.upgradeVersion();
			await this.releasePackage();
		} catch (err: any) {
			log.error('[cli-release]', `${err?.message}`);
			// throw err;
		}
	}

	async prepare() {
		/**
		 * NOTE: general ideas
		 *
		 * 1, check if is a npm project and get information from package.json
		 * 2, check if the "files" field of package.json and the .gitignore file are exist
		 * 3, check if is a valid git repo and the current branch is main/master
		 * 4, check npm registry
		 * 5, check if the user is logged into npm
		 */
		try {
			const pkgInfo = getInfoFromPkgJson();
			const isExistGitIgnore = this.checkGitIgnore();

			if (!pkgInfo?.files && !isExistGitIgnore) {
				throw new Error(
					'please make sure have the "files" field in package.json or have .gitignore file in the current working directory',
				);
			}

			await this.checkMainBranch();
			await this.checkNotCommitted();
			await this.checkStash();
			await this.checkNpmRegistry();
			await this.checkNpmLogin();

			const { name, version } = pkgInfo;
			this.pkgInfo = {
				packageName: name,
				version,
			};
		} catch (error) {
			throw error;
		}
	}

	async checkMainBranch() {
		const isRepo = await this.git.checkIsRepo();

		if (!isRepo) {
			throw new Error('the current working directory is invalid git repository');
		}

		const branch = await this.git.branch();
		if (!['main', 'master'].includes(branch.current)) {
			throw new Error(
				`the current git branch is not main or master, please run the command: "git checkout main", then try again!`,
			);
		}
		this.branch = branch.current;
		log.success('[cli-release]', `current git branch: ${branch.current}`);
	}

	checkGitIgnore() {
		const cwdPath = process.cwd();
		const gitIgnore = path.resolve(cwdPath, '.gitignore');

		if (!fs.existsSync(gitIgnore)) return false;

		return true;
	}

	async checkNpmRegistry() {
		const homeDir = process.env[NewEnvVariables.USER_HOME]!;
		const npmRcPath = path.resolve(homeDir, '.npmrc');
		const npmRcObj = readDotFileToObj<{
			registry: string;
		}>(npmRcPath);
		const registry = npmRcObj?.registry;
		log.info('[cli-release]', `current npm registry: ${registry}`);

		if (registry && registry !== NPM_REGISTRY) {
			await spawnAsync('npx', ['nrm', 'use', 'npm'], {
				cwd: process.cwd(),
				stdio: 'ignore',
			});
			log.success(
				'[cli-release]',
				`run "npx nrm use npm" successful and current npm registry:  https://registry.npmjs.org/`,
			);
		}
	}

	async checkNpmLogin() {
		// const execRes = shelljs.exec('npm whoami');
		const execCode = await spawnAsync('npm', ['whoami'], {
			cwd: process.cwd(),
			stdio: 'inherit',
			shell: true,
		});

		if (execCode === 0) {
			log.success('[cli-release]', 'the user have been logged in npm');
		} else if (execCode === 1) {
			log.warn('[cli-release]', `you're not logged into npm, please login first!`);
			await spawnAsync('npm', ['login'], {
				cwd: process.cwd(),
				stdio: 'inherit',
			});
		}
	}

	async checkNotCommitted() {
		const status = await this.git.status();
		const { not_added, created, deleted, modified, renamed } = status;
		const isNotEmptyStatus =
			not_added.length > 0 ||
			created.length > 0 ||
			deleted.length > 0 ||
			modified.length > 0 ||
			renamed.length > 0;

		if (isNotEmptyStatus) {
			throw new Error('the git status is not empty, please handle manually!');
		}

		log.success('[cli-release]', 'the git status is empty');
	}

	async checkStash() {
		log.info('[cli-git]', 'check stash records');

		const stashList = await this.git.stashList();

		if (stashList.all.length > 0) {
			await this.git.stash(['pop']);
			log.success('[cli-git]', 'stash pop successful');
		}

		await this.git.push('origin', this.branch);
		log.success('cli-release', 'execute push operations successful before publish');
	}

	async upgradeVersion() {
		const { version } = this.pkgInfo || {};

		if (version) {
			const upgradeType = (await inquireUpgradeVersionType(version)).upgradeType;
			await spawnAsync('npm', ['version', upgradeType], {
				stdio: 'inherit',
			});
			await this.git.push('origin', this.branch);
			log.success('cli-release', `upgraded version successful and push to ${this.branch} branch`);
		}
	}

	async releasePackage() {
		await spawnAsync('npm', ['publish', '-access', 'public'], {
			stdio: 'inherit',
		});
	}
}

function releaseCmd(args: any[]) {
	return new ReleaseCommand(args);
}

export default releaseCmd;
