/*
 * @Author: fujia
 * @Date: 2021-12-11 21:10:04
 * @LastEditTime: 2021-12-13 15:55:39
 * @LastEditors: fujia(as default)
 * @Description: A package to achieve deploy flows for stage cli.
 * @FilePath: /stage/commands/cli-publish/src/index.ts
 */
import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';

import { PkgInfo } from './interface';

export class PublishCommand extends CliCommand {
  pkgInfo: PkgInfo | undefined;
  constructor(args: any[]) {
    super(args);
    this.pkgInfo = undefined;
  }

  init() {
    // NOTE: handle params
  }

  async exec() {
    /**
    * NOTE: steps
    * 1, initial
    * 2, git flow automatic
    * 3, build and publish
    */
    try {
      await this.prepare();
    } catch (err: any) {
      log.error('[cli-init]', err?.message);

      if (process.env.LOG_LEVEL === 'verbose') {
        console.log(err);
      }
    }
  }

  prepare() {
    /**
    * NOTE: To-Dos
    *
    * 1, check if a npm project
    * 2, check if include some fields:  name, version, and build script etc.
    */
    const cwdPath = process.cwd();
    const pkgJsonPath = path.resolve(cwdPath, 'package.json');
    log.verbose('[cli-publish]', pkgJsonPath);

    if (!pathExistSync(pkgJsonPath)) {
      throw new Error('The file of package.json is not exist!');
    }

    const pkgDetail = fse.readJSONSync(pkgJsonPath);
    const { name, version, scripts } = pkgDetail;
    if (!name || !version || !scripts || !scripts.build) {
      throw new Error('The file of package.json is invalid, which should include these fields: name, version, scripts and build command!')
    }
    this.pkgInfo = {
      name,
      version,
      cwd: cwdPath
    };
  }
}


function publishCmd (args: any[]) {
  return new PublishCommand(args);
}

export default publishCmd;
