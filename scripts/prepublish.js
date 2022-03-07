#!/usr/bin/env node

const chalk = require('chalk');
const { execSync, spawn } = require('child_process');

const ORIGIN_REGISTRY = 'https://registry.npmjs.org/';
/**
 * NOTE: We expect to run "npm publish" command in the "release" branch.
 */
const RELEASE_BRANCH = 'release';
const log = console.log;

const spawnAsync = (command, args, options) => {
	return new Promise((resolve, reject) => {
		const cp = spawn(command, args, options);

		cp.on('error', (err) => {
			reject(err);
		});

		cp.on('exit', (chunk) => {
			resolve(chunk);
		});
	});
};

async function prepublish() {
	const curBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().replace(/\s+/, '');
	const curRegistry = execSync('npm get registry').toString().replace(/\s+/, '');

	if (curBranch !== RELEASE_BRANCH) {
		log(
			chalk.yellow(
				`The publish operation should be in the ${RELEASE_BRANCH} branch, but now it's ${curBranch}. You can execute "git checkout ${RELEASE_BRANCH}".`,
			),
		);
		process.exit(0);
	}

	try {
		if (curRegistry !== ORIGIN_REGISTRY) {
			execSync(`npm set registry ${ORIGIN_REGISTRY}`);
		}

		const execCode = await spawnAsync('npm', ['whoami', '--registry', ORIGIN_REGISTRY], {
			stdio: 'inherit',
			shell: true,
		});

		if (execCode === 0) {
			log(chalk.green('You have been logged in npm'));
		} else if (execCode === 1) {
			log('');
			log(chalk.yellow(`You're not logged into npm, please login first!`));
			log('');

			await spawnAsync('npm', ['login', '--registry', ORIGIN_REGISTRY], {
				cwd: process.cwd(),
				stdio: 'inherit',
			});
		}
	} catch (error) {
		log('');
		log(chalk.red(`exec "npm run prepublish" failed and ${error}`));
	}
}

prepublish();
