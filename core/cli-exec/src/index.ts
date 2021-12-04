/*
 * @Author: fujia
 * @Date: 2021-12-04 15:48:52
 * @LastEditTime: 2021-12-04 20:22:21
 * @LastEditors: fujia(as default)
 * @Description:
 * @FilePath: /stage/core/cli-exec/src/index.ts
 */
import CliPackage from '@fujia/cli-package';
import { CMD_MAP_PACKAGE } from './constants';

function exec() {
  const localPath = process.env.STAGE_CLI_LOCAL || '';
  const homeDir = process.env.STAGE_CLI_HOME || '';
  // NOTE: type is Command
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name() as string;
  const pkgName = CMD_MAP_PACKAGE[cmdName] as string;
  const packageVersion = 'latest';

  if (!localPath) {
    // NOTE: generate cache path
  }

  const pkg = new CliPackage({
    localPath,
    storePath: homeDir,
    name: pkgName,
    version: packageVersion
  });
  console.log(process.env.STAGE_CLI_LOCAL);
}

export default exec;
