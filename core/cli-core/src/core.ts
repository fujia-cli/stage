import path from 'path';
import semver from 'semver';
import { red, yellow } from 'colors/safe';
import { checkRoot } from '@fujia/root';
import log from '@fujia/cli-log';
import { NewEnvVariables, CUSTOM_TPL_FILE, STAGE_CONFIG_FILE } from '@fujia/cli-utils';
import { getLatestVersion } from '@fujia/get-pkg-info';
import userHome from '@fujia/user-home';
import { pathExistSync } from '@fujia/check-path';
import fse from 'fs-extra';

import registerCommand, { program } from './register-command';

const pkg = require('../package.json');
import { DEFAULT_CLI_HOME } from './constant';

let homeDir: string;

/**
 * @description the core flows
 */
const core = async () => {
	try {
		await prepare();
		registerCommand();
	} catch (e: any) {
		log.error('[cli-core]', e?.message);

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
	await createCustomTplFile();
	createStageRcFile();
}

async function createCustomTplFile() {
	const stageHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
	const customTplFile = path.resolve(stageHome, CUSTOM_TPL_FILE);

	if (!pathExistSync(customTplFile)) {
		const tplObj = {
			nameList: [],
			pkgList: [],
		};

		await fse.writeJSON(customTplFile, tplObj);

		log.success('', `create the ${customTplFile} file successfully`);
	}
}

function createStageRcFile() {
	const stageHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
	const globalConfigFile = path.resolve(stageHome, STAGE_CONFIG_FILE);

	if (!pathExistSync(globalConfigFile)) {
		fse.writeFileSync(globalConfigFile, '');

		log.success('', `create the ${globalConfigFile} file successfully`);
	}
}

async function checkVersionUpgrade() {
	const curVersion = pkg.version;
	const npmName = pkg.name;
	log.verbose(
		'[cli-core]',
		`
      npmName: ${npmName},
      curVersion: ${curVersion}
    `,
	);
	const latestVersion = await getLatestVersion(npmName, curVersion);

	if (latestVersion && semver.gt(latestVersion, curVersion)) {
		log.info(
			``,
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
	log.info('', `Thanks to use @fujia/stage(version: ${pkg.version})^_^`);
}

export default core;
