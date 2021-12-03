import { homedir } from 'os';
import { access } from 'fs/promises';
import log from '@fujia/cli-log';
import semver from 'semver';
import { red } from 'colors/safe';
import { checkRoot } from '@fujia/root';

const pkg = require('../package.json');
import { LOWEST_NODE_VERSION } from './constant'

export default function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
  } catch (e: any) {
    log.error(e.message);
  }
}

async function checkUserHome() {
  try {
    const userHome = homedir();
    await access(userHome)
  } catch (error) {
    throw new Error(red('Doesn\'t exist home directory for current login user.'));
  }
}

function checkRootPermission() {
  checkRoot();
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

