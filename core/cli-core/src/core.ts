import path from 'path';
import semver from 'semver';
import { red, yellow } from 'colors/safe';
import { checkRoot } from '@fujia/root';
import log from '@fujia/cli-log';
import { NewEnvVariables } from '@fujia/cli-utils';
import { getLatestVersion } from '@fujia/get-pkg-info';
import userHome from '@fujia/user-home';
import { pathExistSync } from '@fujia/check-path';
import fse from 'fs-extra';

import registerCommand, { program } from './register-command';

const pkg = require('../package.json');
import { DEFAULT_CLI_HOME } from './constant';
import { StageCliHome } from './interface';

let homeDir: string;

/**
 * @description the core flows
 */
const core = async () => {
	try {
		await prepare();
		registerCommand();
	} catch (e: any) {
		log.error('[core/cli]', e?.message);

		if (program.debug) {
			// NOTE: in debug mode: print the call stack of error.
			console.error(e);
		}
	}
};

async function prepare() {
	checkPkgVersion();
	checkRoot();
	await checkUserHome();
	await checkStageHome();
	await checkVersionUpgrade();
}

async function checkVersionUpgrade() {
	const curVersion = pkg.version;
	const npmName = pkg.name;
	const latestVersion = await getLatestVersion(npmName, curVersion);

	if (latestVersion && semver.gt(latestVersion, curVersion)) {
		log.warn(
			`[${npmName} - upgrade]`,
			yellow(`
      The latest version(${latestVersion}) is available, please upgrade it manually!
      Current version is ${curVersion}, you can run follows command to install it:

      npm i -g ${npmName}
    `),
		);
	}
}

async function checkStageHome() {
	const stageCliHome = path.resolve(homeDir, DEFAULT_CLI_HOME);

	if (!pathExistSync(stageCliHome)) {
		fse.ensureDirSync(stageCliHome);
	}

	if (!pathExistSync(stageCliHome)) {
		throw new Error(`the stage home directory(${stageCliHome}) is not exists`);
	}

	process.env[NewEnvVariables.STAGE_CLI_HOME] = stageCliHome;
}

async function checkUserHome() {
	const curUserHome = await userHome();

	if (!curUserHome) throw new Error(red("Doesn't exist home directory for current login user."));

	homeDir = curUserHome;
	process.env[NewEnvVariables.USER_HOME] = curUserHome;
}

function checkPkgVersion() {
	log.info('', `Thanks to use @fujia/stage(version: ${pkg.version})🏖`);
}

export default core;
