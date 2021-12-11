import { homedir } from 'os';
import path from 'path';
import { access } from 'fs/promises';
import semver from 'semver';
import { red, yellow, gray } from 'colors/safe';
import { checkRoot } from '@fujia/root';
import dotenv from 'dotenv';
import commander from 'commander';
import log from '@fujia/cli-log';
import exec from '@fujia/cli-exec';
import { getLatestVersion } from '@fujia/get-pkg-info';

const pkg = require('../package.json');
import { DEFAULT_CLI_HOME } from './constant'
import {
  StageCliHome,
  StageCli,
  NewEnvVariables,
} from './interface';

let userHome: string;
const program: StageCli = new commander.Command();

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
  // checkNodeVersion();
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
    .command('init [projectName]')
    .option('-f, --force', 'force to init project')
    .action(exec);

  // NOTE: register publish command
  program
    .command('publish')

  // NOTE: enable debug model
  program.on('option:debug', function (this: StageCli) {
    if (this.opts().debug) {
      process.env[NewEnvVariables.LOG_LEVEL] = 'verbose';
    } else {
      process.env[NewEnvVariables.LOG_LEVEL] = 'info';
    }

    log.level = process.env[NewEnvVariables.LOG_LEVEL]!;
  });

  program.on('option:localPath', function (this: StageCli) {
    process.env[NewEnvVariables.STAGE_CLI_LOCAL] = this.opts().localPath;
  });

  // NOTE: listener any unknown commands
  program.on('command:*', (cmdList: string[]) => {
    const availableCommands = program.commands.map(cmd => cmd.name());

    console.log(red(`Unknown Command: ${cmdList[0]}`));
    if (availableCommands.length > 0) {
      console.log(gray(`The available commands are: ${availableCommands.join(', ')}`));
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
    const dotenvPath = path.resolve(userHome, '.env');
    await access(dotenvPath)
    dotenv.config({
      path: dotenvPath,
    });
  } catch (err) {
    createDefaultEnvConfig();
  }
}

function createDefaultEnvConfig() {
  const cliHomeDir = process.env[NewEnvVariables.STAGE_CLI_HOME];
  const cliConfig: StageCliHome = {
    home: userHome
  };

  if (cliHomeDir) {
    cliConfig['stageCliHome'] = path.join(userHome, cliHomeDir);
  } else {
    cliConfig['stageCliHome'] = path.join(userHome, DEFAULT_CLI_HOME);
  }
  // to inject the .env path into the PATH
  process.env[NewEnvVariables.STAGE_CLI_HOME] = cliConfig.stageCliHome;
}

async function checkUserHome() {
  try {
    userHome = homedir();
    await access(userHome)
  } catch (error) {
    throw new Error(red('Doesn\'t exist home directory for current login user.'));
  }
}

function checkPkgVersion() {
  log.info('[core/cli]', pkg.version);
}

export default core;

