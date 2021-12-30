/*
 * @Author: fujia
 * @Date: 2021-12-04 15:48:52
 * @LastEditTime: 2021-12-30 13:35:19
 * @LastEditors: fujia(as default)
 * @Description: An execute package of stage cli
 * @FilePath: /stage/core/cli-exec/src/index.ts
 */
import path from 'path';
import CliPackage from '@fujia/cli-package';
import log from '@fujia/cli-log';
import { spawn, NewEnvVariables } from '@fujia/cli-utils';

import { CMD_MAP_PACKAGE, CACHE_DIR } from './constants';

export type CmdList = keyof typeof CMD_MAP_PACKAGE;

async function exec(...args: any[]) {
	let localPath = process.env[NewEnvVariables.STAGE_CLI_LOCAL];
	let storeDir = '';
	let pkg: CliPackage | undefined;
	const stageCliHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
	// NOTE: type is Command
	const cmdObj = args[args.length - 1];
	const cmdName = cmdObj.name() as CmdList;
	const pkgName = CMD_MAP_PACKAGE[cmdName];
	const packageVersion = 'latest';

	log.verbose(
		'[cli-exec]',
		`
    localPath: ${localPath},
    pkgName: ${pkgName},
    cmdName: ${cmdName}
  `,
	);

	if (!localPath) {
		// NOTE: generate cache path
		localPath = path.resolve(stageCliHome, CACHE_DIR);
		storeDir = path.resolve(localPath, 'node_modules');
		log.verbose('localPath', localPath);
		log.verbose('storeDir', storeDir);

		pkg = new CliPackage({
			localPath,
			storeDir,
			name: pkgName,
			version: packageVersion,
		});

		if (await pkg.exist()) {
			// NOTE: update package
			await pkg.update();
		} else {
			// NOTE: install package
			await pkg.install();
		}
	} else {
		pkg = new CliPackage({
			localPath,
			name: pkgName,
			version: packageVersion,
		});
	}

	const rootFile = pkg.getEntryFilePath();
	log.verbose('[cli-exec]', `rootFile: ${rootFile}`);

	if (rootFile) {
		try {
			// NOTE: expects call in the child process
			// require(rootFile).default.call(null, Array.from(args));
			const cmd = args[args.length - 1];
			const formatCmd = Object.create(null);
			Object.keys(cmd).forEach((k) => {
				if (cmd.hasOwnProperty(k) && !k.startsWith('_') && k !== 'parent') {
					formatCmd[k] = cmd[k];
				}
			});
			/**
			 * NOTE: There are some changes in different versions, such as:
			 * 1, to get one option value, in V8.3.0，you can get like this: cmd.opts().force, however
			 *  in v6.x, just run cmd.force
			 */
			const { force, refreshRepo, refreshOwner, refreshToken } = cmd.opts();
			log.verbose('[cli-exec]', `the commander options: ${cmd.opts()}`);
			formatCmd.force = force;

			switch (cmdName) {
				case 'publish':
					formatCmd.refreshRepo = refreshRepo;
					formatCmd.refreshOwner = refreshOwner;
					formatCmd.refreshToken = refreshToken;
					break;

				default:
					break;
			}

			args[args.length - 1] = formatCmd;

			const code = `require('${rootFile}').default.call(null, ${JSON.stringify(args)})`;

			const child = spawn('node', ['-e', code], {
				cwd: process.cwd(),
				stdio: 'inherit', // Recommended: uses this value
			});

			child.on('error', (err) => {
				log.error('', err.message);
				process.exit(1);
			});

			child.on('exit', (err) => {
				log.info('', 'process exited!');
				process.exit(err!);
			});
		} catch (err: any) {
			log.error('', err?.message);
		}
	}
}

export default exec;
