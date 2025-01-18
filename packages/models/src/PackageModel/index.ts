import path from 'path';
import { isPlainObject, toRawType } from '@fujia/hammer';
import pkgDir from 'pkg-dir';
import {
  enhanceLog as log,
  getNpmRegistry,
  getLatestVersion,
  getPkgInfo,
  crossPath,
} from '@fujia/stage-share';
import npmInstall from 'npminstall';
import { pathExistSync } from '@fujia/check-path';
import fse from 'fs-extra';

import { ConstructorOptions, ICliPackage } from './interface';

export class PackageModel implements ICliPackage {
  localPath: string;
  pkgName: string;
  pkgVersion: string;
  storeDir: string;
  cacheFilePathPrefix: string;
  constructor(options: ConstructorOptions) {
    if (!isPlainObject(options))
      throw new Error(`The params of options must be an object.
      But now get a value with type of ${toRawType(options)}.`);

    log.verbose(
      '[cli-package]',
      `
      localPath: ${options?.localPath}
      pkgName: ${options?.name}
      pkgVersion: ${options?.version}
      storeDir: ${options?.storeDir}

    `,
    );

    this.localPath = options.localPath;
    this.storeDir = options.storeDir || '';
    this.pkgName = options.name;
    this.pkgVersion = options.version;
    this.cacheFilePathPrefix = this.pkgName.replace('/', '_');
  }

  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.pkgVersion}@${this.pkgName}`,
    );
  }

  genCacheFilePath(version: string) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${version}@${this.pkgName}`,
    );
  }

  async prepare() {
    // NOTE: check if the package is exist
    try {
      await getPkgInfo(this.pkgName);

      if (this.storeDir && !pathExistSync(this.storeDir)) {
        fse.mkdirp(this.storeDir);
      }

      if (this.pkgVersion === 'latest') {
        const latestVer = await getLatestVersion(this.pkgName);
        log.verbose(
          '[cli-package]',
          `The version of installing package is: ${latestVer}`,
        );
        if (latestVer) {
          this.pkgVersion = latestVer;
        }
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        log.error(
          '',
          `Oops! The package of ${this.pkgName} not found. Ensure that you have published in https://www.npmjs.com/`,
        );
      }
      log.error('', err?.message);
      process.exit(1);
    }
  }

  async exist() {
    if (this.storeDir) {
      await this.prepare();

      return pathExistSync(this.cacheFilePath);
    }

    return pathExistSync(this.localPath);
  }

  async runNpmInstall(version?: string) {
    try {
      return await npmInstall({
        root: this.localPath,
        storeDir: this.storeDir,
        registry: getNpmRegistry(),
        pkgs: [
          {
            name: this.pkgName,
            version: version || this.pkgVersion,
          },
        ],
      });
    } catch (err: any) {
      log.info(
        '',
        `The ${this.pkgName} package install failed. the errors: ${err?.message || err}`,
      );
    }
  }

  async install() {
    log.verbose('[cli-package]', `Starting install ${this.pkgName}...`);

    await this.prepare();
    return await this.runNpmInstall();
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
      console.log(
        `oops! Don't get the latest version of ${latestVersion} when invoked update in [cli-package]`,
      );
      console.log();
      return;
    }
    const latestVerCachedPath = this.genCacheFilePath(latestVersion);
    if (!pathExistSync(latestVerCachedPath)) {
      await this.runNpmInstall(latestVersion);
      this.pkgVersion = latestVersion;
    } else {
      this.pkgVersion = latestVersion;
    }
  }

  getEntryFilePath() {
    const _getEntryFile = (localPath: string) => {
      const packageDir = pkgDir.packageDirectorySync({
        cwd: localPath,
      });

      log.verbose(
        '[cli-package]',
        `
        localPath: ${localPath}
        cacheFilePath: ${this.cacheFilePath}
        packageDir: ${packageDir}
      `,
      );

      if (packageDir) {
        const pkgFile = require(path.resolve(packageDir, 'package.json'));

        if (pkgFile && pkgFile.main) {
          // NOTE: resolve path compatibility
          return crossPath(path.resolve(packageDir, pkgFile.main));
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
