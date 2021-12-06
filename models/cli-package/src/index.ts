/*
 * @Author: fujia
 * @Date: 2021-12-04 16:57:47
 * @LastEditTime: 2021-12-06 17:45:14
 * @LastEditors: fujia(as default)
 * @Description: A class of cli module
 * @FilePath: /stage/models/cli-package/src/index.ts
 */
import path from 'path';
import { isPlainObject, toRawType } from '@fujia/hammer';
import { packageDirectorySync } from 'pkg-dir';
import crossPath from '@fujia/cross-path';
import { getDefaultRegistry, getLatestVersion } from '@fujia/get-pkg-info';
import npmInstall from 'npminstall';
import { pathExistSync } from '@fujia/check-path';
import fse from 'fs-extra';
import userHome from '@fujia/user-home';

import { ConstructorOptions, ICliPackage } from './interface';

class CliPackage implements ICliPackage {
  localPath: string;
  pkgName: string;
  pkgVersion: string;
  storeDir: string;
  cacheFilePathPrefix: string;
  constructor(options: ConstructorOptions) {
    if (!isPlainObject(options)) throw new Error(`The params of options must be an object.
      But now get a value with type of ${toRawType(options)}.`);

    this.localPath = options.localPath;
    this.storeDir = options.storeDir;
    this.pkgName = options.name;
    this.pkgVersion = options.version;
    this.cacheFilePathPrefix = this.pkgName.replace('/', '_')
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.pkgVersion}@${this.pkgName}`);
  }

  genCacheFilePath(version: string) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${version}@${this.pkgName}`);
  }

  async prepare() {
    if (this.storeDir && !pathExistSync(this.storeDir)) {
      fse.mkdirp(this.storeDir);
    }

    if (this.pkgVersion === 'latest') {
      const latestVer = await getLatestVersion(this.pkgName);
      if (latestVer) {
        this.pkgVersion = latestVer;
      }
    }
  }

  async exist() {
    if (this.storeDir) {
      await this.prepare();

      return pathExistSync(this.cacheFilePath);
    }

    return pathExistSync(this.localPath);
  }

  async install() {
    await this.prepare();

    return npmInstall({
      root: this.localPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.pkgName,
          version: this.pkgVersion
        }
      ]
    });
  }

  async update() {
    /**
    * NOTE:
    * 1, obtain the latest version
    * 2, then check the corresponding path whether exists
    * 3, if not, installing the latest version
    */
    await this.prepare();
    const latestVersion = await getLatestVersion(this.pkgName);
    if (!latestVersion) {
      console.log(`oops! Don't get the latest version of ${latestVersion} when invoked update in [cli-package]`);
      console.log();
      return;
    }
    const latestVerCachedPath = this.genCacheFilePath(latestVersion);
    if (!pathExistSync(latestVerCachedPath)) {
      await npmInstall({
        root: this.localPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.pkgName,
            version: latestVersion
          }
        ]
      });

      this.pkgVersion = latestVersion;
    }
  }

  getEntryFilePath() {
    const _getEntryFile = (localPath: string) => {
      const pkgDir = packageDirectorySync({
        cwd: localPath
      });

      if (pkgDir) {
        const pkgFile = require(path.resolve(pkgDir, 'package.json'));

        if (pkgFile && pkgFile.main) {
          // NOTE: resolve path compatibility
          return crossPath(path.resolve(pkgDir, pkgFile.main));
        }
      }

      return null;
    };

    if (this.storeDir) {
      return _getEntryFile(this.cacheFilePath);
    }

    return _getEntryFile(this.localPath);
  }
}

export default CliPackage;