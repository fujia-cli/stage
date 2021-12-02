'use strict';

module.exports = core;

const log = require('@fujia/cli-log');
const semver = require('semver');
const colors = require('colors/safe');

const pkg = require('../package.json');
const { LOWEST_NODE_VERSION } = require('./constant')

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
  } catch (e) {
    log.error(e.message);
  }
}

function checkNodeVersion() {
  const curNodeVersion = process.version;

  if (semver.lt(curNodeVersion, LOWEST_NODE_VERSION)) {
    throw new Error(colors.red(`[stage] need the lowest version of node.js is ${LOWEST_NODE_VERSION}, but now obtained ${curNodeVersion}.`));
  }
}

function checkPkgVersion() {
  log.info('cli', pkg.version);
}
