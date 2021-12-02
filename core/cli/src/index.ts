import log from '@fujia/cli-log';
import semver from 'semver';
import { red } from 'colors/safe';
// import userHome from 'home-or-tmp';
import rootCheck from 'root-check';

// import pkg from '../package.json';
import { LOWEST_NODE_VERSION } from './constant'

const version = PACKAGE_JSON.version;

console.log(version);

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

function checkUserHome() {
  // console.log(userHome);
}

function checkRoot() {
  rootCheck();
}

function checkNodeVersion() {
  const curNodeVersion = process.version;

  if (semver.lt(curNodeVersion, LOWEST_NODE_VERSION)) {
    throw new Error(red(`[stage] need the lowest version of node.js is ${LOWEST_NODE_VERSION}, but now obtained ${curNodeVersion}.`));
  }
}

function checkPkgVersion() {
  // log.info('cli', pkg.version);
}

