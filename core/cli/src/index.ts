import { homedir } from 'os';
import path from 'path';
import { access } from 'fs/promises';
import semver from 'semver';
import { red, yellow, gray } from 'colors/safe';
import { checkRoot } from '@fujia/root';
import dotenv from 'dotenv';
import commander from 'commander';
import log from '@fujia/cli-log';
import init from '@fujia/cli-init';
import { getLatestVersion } from '@fujia/get-pkg-info';

const pkg = require('../package.json');
import { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } from './constant'
import {
  IArgs,
  StageCliHome,
  StageCli,
} from './interface';

let args: IArgs;
let userHome: string;
const program: StageCli = new commander.Command();

export default async function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    await checkUserHome();
    // checkInputArgs();
    await checkEnv();
    await checkVersionUpgrade();
    await registerCommand();
  } catch (e: any) {
    log.error('[core/cli]', e?.message);
  }
}

function registerCommand() {
  program
    .name(getCliName())
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', 'enable debug model', false);

  // NOTE: register command
  program
    .command('init [projectName]')
    .option('-f, --force', 'force to init project')
    .action((projectName, cmdObj) => {

    });

  // NOTE: enable debug model
  program.on('option:debug', () => {
    if (program.debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
  });

  // NOTE: listener any unknown commands
  program.on('command:*', (cmdList: string[]) => {
    const availableCommands = program.commands.map(cmd => cmd.name());

    console.log(red(`Unknown Command: ${cmdList[0]}`));
    if (availableCommands.length > 0) {
      console.log(gray(`The available commands are: ${availableCommands.join(', ')}`));
    }
  });

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }

  program.parse(process.argv);
}

function getCliName() {
  return Object.keys(pkg.bin)[0];
}

async function checkVersionUpgrade() {
  const curVersion = pkg.version;
  const npmName = pkg.name;
  const latestVersion = await getLatestVersion(curVersion, npmName);

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
    createEnvDefaultConfig();
  }
}

function createEnvDefaultConfig() {
  const cliConfig: StageCliHome = {
    home: userHome
  };

  if (process.env.STAGE_CLI_HOME) {
    cliConfig['stageCliHome'] = path.join(userHome, process.env.STAGE_CLI_HOME);
  } else {
    cliConfig['stageCliHome'] = path.join(userHome, DEFAULT_CLI_HOME);
  }
  // to inject the .env path into the PATH
  process.env.STAGE_CLI_HOME = cliConfig.stageCliHome;
}

// function checkInputArgs() {
//   args = minimist(process.argv.slice(2));
//   checkArgs();
// }

// function checkArgs() {
//   if (args.debug) {
//     process.env.LOG_LEVEL = 'verbose';
//   } else {
//     process.env.LOG_LEVEL = 'info';
//   }
//   log.level = process.env.LOG_LEVEL;
// }

async function checkUserHome() {
  try {
    userHome = homedir();
    await access(userHome)
  } catch (error) {
    throw new Error(red('Doesn\'t exist home directory for current login user.'));
  }
}

function checkNodeVersion() {
  const curNodeVersion = process.version;

  if (semver.lt(curNodeVersion, LOWEST_NODE_VERSION)) {
    throw new Error(red(`[stage] need the lowest version of node.js is ${LOWEST_NODE_VERSION}, but now obtained ${curNodeVersion}.`));
  }
}

function checkPkgVersion() {
  log.info('core/cli', pkg.version);
}

