/*
 * @Author: fujia
 * @Date: 2021-12-04 16:57:47
 * @LastEditTime: 2021-12-04 17:44:31
 * @LastEditors: fujia(as default)
 * @Description: A class of cli module
 * @FilePath: /stage/models/cli-package/src/index.ts
 */
import { isPlainObject, toRawType } from '@fujia/hammer';

import { ConstructorOptions, ICliPackage } from './interface';

class CliPackage implements ICliPackage {
  localPath: string;
  storePath: string;
  packageName: string;
  packageVersion: string;
  constructor(options: ConstructorOptions) {
    if (!isPlainObject(options)) throw new Error(`The params of options must be an object.
      But now get a value with type of ${toRawType(options)}.`);

    this.localPath = options.localPath;
    this.storePath = options.storePath;
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

  }
}

export default CliPackage;
