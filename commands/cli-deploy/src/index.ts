import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import { NewEnvVariables } from '@fujia/cli-utils';

export class DeployCommand extends CliCommand {
	constructor(args: any[]) {
		super(args);
	}

	init() {
		log.verbose('[cli-deploy]', 'init');
	}

	async exec() {
		try {
			const stageCliHome = process.env[NewEnvVariables.STAGE_CLI_HOME];

			if (!stageCliHome) throw new Error('The stage cli home directory is not exist');
		} catch (err: any) {
			log.error('', `${err?.message}`);
			throw err;
		}
	}
}

function deployCmd(args: any[]) {
	return new DeployCommand(args);
}

export default deployCmd;
