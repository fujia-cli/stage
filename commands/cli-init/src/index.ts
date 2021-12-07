/*
 * @Author: fujia
 * @Date: 2021-12-04 10:54:19
 * @LastEditTime: 2021-12-07 10:01:53
 * @LastEditors: fujia(as default)
 * @Description: To initialize a project
 * @FilePath: /stage/commands/cli-init/src/index.ts
 */
import CliCommand from '@fujia/cli-command';

export class CliInit extends CliCommand {

}

function init (projectName: string, cmdObj: object) {
  return new CliInit();
}

export default init;
