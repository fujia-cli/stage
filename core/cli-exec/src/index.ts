/*
 * @Author: fujia
 * @Date: 2021-12-04 15:48:52
 * @LastEditTime: 2021-12-06 17:25:22
 * @LastEditors: fujia(as default)
 * @Description:
 * @FilePath: /stage/core/cli-exec/src/index.ts
 */
import path from 'path';
import CliPackage from '@fujia/cli-package';
import log from '@fujia/cli-log';
import { CMD_MAP_PACKAGE } from './constants';

const CACHE_DIR = 'caches';

async function exec(...args: any[]) {
  let localPath = process.env.STAGE_CLI_LOCAL;
  let storeDir = '';
  let pkg: CliPackage | undefined;
  const homeDir = process.env.STAGE_CLI_HOME || '';
  // NOTE: type is Command
  const cmdObj = args[args.length - 1];
  const cmdName = cmdObj.name() as string;
  const pkgName = CMD_MAP_PACKAGE[cmdName] as string;
  const packageVersion = 'latest';

  if (!localPath) {
    // NOTE: generate cache path
    localPath = path.resolve(homeDir, CACHE_DIR);
    storeDir = path.resolve(localPath, 'node_modules')
    log.verbose('localPath', localPath);
    log.verbose('storeDir', storeDir);

    pkg = new CliPackage({
      localPath,
      storeDir: homeDir,
      name: pkgName,
      version: packageVersion
    });

    if (await pkg.exist()) {
      // NOTE: update package
      await pkg.update()
    } else {
      // NOTE: install package
      pkg.install();
    }
  } else {
    pkg = new CliPackage({
      localPath,
      storeDir: homeDir,
      name: pkgName,
      version: packageVersion
    });
  }

  const rootFile = pkg.getEntryFilePath();
  if (rootFile) {
    require(rootFile).apply(null, args);
  }
}

export default exec;