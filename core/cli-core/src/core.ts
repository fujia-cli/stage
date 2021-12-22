
import path from 'path';
import { access } from 'fs/promises';
import semver from 'semver';
import { red, yellow, blue } from 'colors/safe';
import { checkRoot } from '@fujia/root';
import dotenv from 'dotenv';
import commander from 'commander';
import log from '@fujia/cli-log';
import { NewEnvVariables, StageCliCmd } from '@fujia/cli-utils';
import exec from '@fujia/cli-exec';
import { getLatestVersion } from '@fujia/get-pkg-info';
import userHome from '@fujia/user-home';

const pkg = require('../package.json');
import { DEFAULT_CLI_HOME } from './constant'
import { StageCliHome } from './interface';

let homeDir: string;
const program: StageCliCmd = new commander.Command();

/**
* NOTE: The core flow
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
}

async function prepare() {
  checkPkgVersion();
  checkRoot();
  await checkUserHome();
  await checkEnv();
  await checkVersionUpgrade();
}

function registerCommand() {
  // global
  program
    .name(getCliName())
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', 'enable debug model', false)
    .option('-lp, --localPath <localPath>', 'specify the local debug file path', '');

  // NOTE: register init command
  program
    .command('init [projectName] [destination]')
    .description('create a project or component in current directory or relative to the current directory')
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
    .description('release a package to npm')
    .option('-a, --access <publishAccess>', 'set publish access is true', 'public')
    .action(exec);

  // NOTE: register deploy command
  program
    .command('deploy')
    .description('deploy an application to cloud server manually')
    .action(exec);

  // NOTE: register clean command
  program
    .command('clean [cacheFileName]')
    .description('clean stage cli caches')
    .action(exec);

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
    const availableCommands = program.commands.map(cmd => cmd.name());
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

async function checkVersionUpgrade() {
  const curVersion = pkg.version;
  const npmName = pkg.name;
  const latestVersion = await getLatestVersion(npmName, curVersion);

  if (latestVersion && semver.gt(latestVersion, curVersion)) {
    log.warn(`[${npmName} - upgrade]`, yellow(`
      The latest version(${latestVersion}) is available, please upgrade it manually!
      Current version is ${curVersion}, you can run follows command to install it:

      npm i -g ${npmName}
    `))
  }
}

async function checkEnv() {
  try {
    const dotenvPath = path.resolve(homeDir, '.env');
    await access(dotenvPath)
    dotenv.config({
      path: dotenvPath,
    });
  } catch (err) {
    createDefaultEnvConfig();
  }
}

function createDefaultEnvConfig() {
  const stageCliHome = process.env[NewEnvVariables.STAGE_CLI_HOME];
  const cliConfig: StageCliHome = {
    home: homeDir
  };

  if (stageCliHome) {
    cliConfig['stageCliHome'] = path.join(homeDir, stageCliHome);
  } else {
    cliConfig['stageCliHome'] = path.join(homeDir, DEFAULT_CLI_HOME);
  }
  // to inject the .env path into the PATH
  process.env[NewEnvVariables.STAGE_CLI_HOME] = cliConfig.stageCliHome;
}

async function checkUserHome() {
  const curUserHome = await userHome();

  if(!curUserHome) throw new Error(red('Doesn\'t exist home directory for current login user.'));

  homeDir = curUserHome;
  process.env[NewEnvVariables.USER_HOME] = curUserHome;
}

function checkPkgVersion() {
  log.info('[core/cli]', pkg.version);
}

export default core;
