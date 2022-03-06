/*
 * @Author: fujia
 * @Date: 2021-12-04 16:57:47
 * @LastEditTime: 2022-03-06 19:56:08
 * @LastEditors: fujia(as default)
 * @Description: A package class for stage cli
 * @FilePath: /stage/models/cli-package/src/index.ts
 */
import path from 'path';
import { readdir, rename } from 'fs/promises';
import { isPlainObject, toRawType, isFunction } from '@fujia/hammer';
import pkgDir from 'pkg-dir';
import crossPath from '@fujia/cross-path';
import { getLatestVersion, getPkgInfo } from '@fujia/get-pkg-info';
import { getNpmRegistry } from '@fujia/cli-utils';
import log from '@fujia/cli-log';
import npmInstall from 'npminstall';
import { pathExistSync } from '@fujia/check-path';
import fse from 'fs-extra';

import { ConstructorOptions, ICliPackage } from './interface';

const NPM_IGNORE_FILES = ['gitignore', 'npmrc'];

class CliPackage implements ICliPackage {
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
		return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${version}@${this.pkgName}`);
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
				log.verbose('[cli-package]', `The version of installing package is: ${latestVer}`);
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
			await npmInstall({
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

			/**
			 * Note: there is an extra step that rename there ignore files by npm, such as: .gitignore, .npmrc etc.
			 */
			await this.ignoreFilesHandle();
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
		await this.runNpmInstall();
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
			const packageDir = pkgDir.sync(localPath);
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

	async ignoreFilesHandle() {
		const tmpDir = path.resolve(this.cacheFilePath, 'template');

		const readTmpDir = await readdir(tmpDir);

		for await (const fileName of readTmpDir) {
			if (NPM_IGNORE_FILES.includes(fileName)) {
				await rename(`${tmpDir}/${fileName}`, `${tmpDir}/.${fileName}`);
			}
		}
	}
}

export default CliPackage;
