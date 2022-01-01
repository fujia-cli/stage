import commander from 'commander';
import { red, blue } from 'colors/safe';
import { NewEnvVariables, StageCliCmd } from '@fujia/cli-utils';
import exec from '@fujia/cli-exec';
import log from '@fujia/cli-log';

export const program: StageCliCmd = new commander.Command();
const pkg = require('../package.json');

export default function registerCommand() {
	// global
	program
		.name(getCliName())
		.usage('<command> [options]')
		.version(pkg.version, '-v, --version')
		.option('-d, --debug', 'enable debug model', false)
		.option('-lp, --localPath <localPath>', 'specify the local debug file path', '');

	// NOTE: register init command
	program
		.command('init [projectName]')
		.description('initializing an universal project quickly')
		.option('-f, --force', 'force to init project')
		.action(exec);

	// NOTE: register publish command
	program
		.command('publish')
		.description('publish a project')
		.option('--refreshRepo', 'force to update the remote Git repository')
		.option('--refreshToken', 'force to update the token of remote repository')
		.option('--refreshOwner', 'force to update the type of remote repository')
		.action(exec);

	// NOTE: register package command
	program
		.command('release')
		.description('release a npm package')
		.option('-a, --access <publishAccess>', 'set publish access is true', 'public')
		.action(exec);

	// NOTE: register deploy command
	program
		.command('deploy', {
			hidden: true,
		})
		.description('deploy a native application')
		.action(exec);

	// NOTE: register docker command
	program
		.command('docker')
		.description('to build a docker image and update corresponding service')
		.option('-b, --build', 'build a docker image', false)
		.option('-u, --updateService [serviceName]', 'update a service')
		.action(exec);

	// NOTE: register service command
	const service = new commander.Command('service');

	service.description('deploy or update a service');

	service
		.command('deploy [stackName] [workDir]')
		.description('deploy a service via docker image or PM2')
		.action(exec);

	service
		.command('update [serviceName]')
		.description('update a service via docker image')
		.action(exec);

	program.addCommand(service);

	// NOTE: register component command
	program
		.command('component <componentName> [destination]', {
			hidden: true,
		})
		.requiredOption('-t, --template <templateType>', 'select a component template')
		.description('create a component template for ui-puzzles UI library')
		.action(exec);

	// NOTE: register clean command
	program.command('clean [cacheFileName]').description('clean caches').action(exec);

	// NOTE: enable debug model
	program.on('option:debug', function (this: StageCliCmd) {
		if (this.opts().debug) {
			process.env[NewEnvVariables.LOG_LEVEL] = 'verbose';
		} else {
			process.env[NewEnvVariables.LOG_LEVEL] = 'info';
		}

		log.level = process.env[NewEnvVariables.LOG_LEVEL]!;
	});

	program.on('option:localPath', function (this: StageCliCmd) {
		process.env[NewEnvVariables.STAGE_CLI_LOCAL] = this.opts().localPath;
	});

	// NOTE: listener any unknown commands
	program.on('command:*', (cmdList: string[]) => {
		const availableCommands = program.commands.map((cmd) => cmd.name());
		console.log(red(`Unknown Command: ${cmdList[0]}`));

		if (availableCommands.length > 0) {
			console.log(blue(`The available commands are: ${availableCommands.join(', ')}`));
			console.log();
		}
	});

	program.parse(process.argv);

	if (program.args && program.args.length < 1) {
		program.outputHelp();
		console.log(); // add a new empty line
	}
}

function getCliName() {
	return Object.keys(pkg.bin)[0];
}
