import { homedir } from 'os';
import path from 'path';
import { access } from 'fs/promises';
import log from '@fujia/cli-log';
import semver from 'semver';
import { red } from 'colors/safe';
import { checkRoot } from '@fujia/root';
import minimist from 'minimist';
import dotenv from 'dotenv';

const pkg = require('../package.json');
import { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } from './constant'

interface IArgs {
  [key: string]: any;
  debug?: boolean;
}
interface StageCliHome {
  home: string;
  stageCliHome?: string;
}

let args: IArgs;
let userHome: string;

export default function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
  } catch (e: any) {
    log.error('[core/cli]', e.message);
  }
}

function checkVersionUpgrade() {
  const curVersion = pkg.version;
  const npmName = pkg.name;
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

function checkInputArgs() {
  args = minimist(process.argv.slice(2));
  checkArgs();
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
}

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

