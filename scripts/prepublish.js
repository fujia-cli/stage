#!/usr/bin/env node

const chalk = require('chalk');
const childProcess = require('child_process');

const ORIGIN_REGISTRY = 'https://registry.npmjs.org/';
/**
 * NOTE: We expect to run "npm publish" command in the "release" branch.
 */
const RELEASE_BRANCH = 'release';

const curBranch = childProcess
	.execSync('git rev-parse --abbrev-ref HEAD')
	.toString()
	.replace(/\s+/, '');
const curNpmRegistry = childProcess.execSync('npm get registry').toString().replace(/\s+/, '');

if (curBranch !== RELEASE_BRANCH) {
	console.log(
		chalk.yellow(
			`The publish operation should be in the ${RELEASE_BRANCH} branch, but now it's ${curBranch}. You can execute "git checkout ${RELEASE_BRANCH}".`,
		),
	);
	process.exit(0);
}

if (curNpmRegistry !== ORIGIN_REGISTRY) {
	childProcess.execSync('npx nrm use npm');
}
