/*
 * @Author: fujia
 * @Date: 2021-12-04 16:57:47
 * @LastEditTime: 2021-12-04 21:02:29
 * @LastEditors: fujia(as default)
 * @Description: A class of cli module
 * @FilePath: /stage/models/cli-package/src/index.ts
 */
import path from 'path';
import { isPlainObject, toRawType } from '@fujia/hammer';
import { packageDirectorySync } from 'pkg-dir';
import crossPath from '@fujia/cross-path';

import { ConstructorOptions, ICliPackage } from './interface';

class CliPackage implements ICliPackage {
  localPath: string;
  packageName: string;
  packageVersion: string;
  constructor(options: ConstructorOptions) {
    if (!isPlainObject(options)) throw new Error(`The params of options must be an object.
      But now get a value with type of ${toRawType(options)}.`);

    this.localPath = options.localPath;
    this.packageName = options.name;
    this.packageVersion = options.version;
  }

  exist() {

  }

  install() {

  }

  update() {

  }

  getEntryFilePath() {
    const pkgDir = packageDirectorySync({
      cwd: this.localPath
    });

    if (pkgDir) {
      const pkgFile = require(path.resolve(pkgDir, 'package.json'));

      if (pkgFile && pkgFile.main) {
        // NOTE: resolve path compatibility
        return crossPath(path.resolve(pkgDir, pkgFile.main));
      }
    }

    return null;
  }
}

export default CliPackage;
