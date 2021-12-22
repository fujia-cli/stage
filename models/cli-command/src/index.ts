/*
 * @Author: fujia
 * @Date: 2021-12-07 09:42:37
 * @LastEditTime: 2021-12-22 13:06:07
 * @LastEditors: fujia(as default)
 * @Description:
 * @FilePath: /stage/models/cli-command/src/index.ts
 */
import { red } from 'colors/safe';
import semver from 'semver';
import log from '@fujia/cli-log';
import { StageCliCmd } from '@fujia/cli-utils';

import { LOWEST_NODE_VERSION } from './constants';


class CliCommand {
  protected argv: any[];
  protected cmd: StageCliCmd | null;
  runner: Promise<unknown>;
  constructor(args: any[]) {
    if (!args || args.length < 1) {
      throw new Error('The params of args can not be undefined or empty.')
    }

    this.argv = args;
    this.runner = this.genRunner();
    this.cmd = null;
  }

  init() {
    throw new Error('The method of init must be implemented.');
  }

  exec() {
    throw new Error('The method of exec must be implemented.');
  }

  initArgs() {
    this.cmd = this.argv[this.argv.length - 1];
    this.argv = this.argv.slice(0, this.argv.length - 1);
  }

  genRunner() {
    return new Promise((_, reject) => {
      let chain = Promise.resolve();

      chain = chain.then(() => {
        this.checkNodeVersion();
      });

      chain = chain.then(() => this.initArgs());

      chain = chain.then(() => this.init());

      chain = chain.then(() => this.exec());

      chain.catch(err => {
        log.error('[cli-command]', err?.message);
        log.verbose('[cli-command]', err);
        reject(err);
      });
    })
  }

  checkNodeVersion() {
    const curNodeVersion = process.version;

    if (semver.lt(curNodeVersion, LOWEST_NODE_VERSION)) {
      throw new Error(red(`[stage] need the lowest version of node.js is ${LOWEST_NODE_VERSION}, but now obtained ${curNodeVersion}.`));
    }
  }

}

export default CliCommand;
