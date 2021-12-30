import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import { NewEnvVariables } from '@fujia/cli-utils';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';

export class DeployCommand extends CliCommand {
	cacheDir: string;
	constructor(args: any[]) {
		super(args);
		this.cacheDir = '';
	}

	init() {
		log.verbose('[cli-deploy]', `cache directory: ${this.argv[0]}`);
		this.cacheDir = this.argv[0] || '';
	}

	async exec() {
		try {
			const stageCliHome = process.env[NewEnvVariables.STAGE_CLI_HOME];

			if (!stageCliHome) throw new Error('The stage cli home directory is not exist');
			console.log(stageCliHome);
		} catch (err: any) {
			log.error('', `err?.message`);
			throw err;
		}
	}
}

function deployCmd(args: any[]) {
	return new DeployCommand(args);
}

export default deployCmd;
