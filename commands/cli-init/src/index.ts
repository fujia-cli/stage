/*
 * @Author: fujia
 * @Date: 2021-12-04 10:54:19
 * @LastEditTime: 2021-12-07 16:23:49
 * @LastEditors: fujia(as default)
 * @Description: To initialize a project
 * @FilePath: /stage/commands/cli-init/src/index.ts
 */
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';

export class CliInit extends CliCommand {
  projectName: string;
  force: boolean;
  constructor(args: any[]) {
    super(args);
    this.projectName = '';
    this.force = false;
  }

  init() {
    this.projectName = this.argv[0] || '';
    this.force = !!this.cmd?.force;

    log.verbose('[cli-init]', `
      projectName: ${this.projectName}
      force: ${this.force}
    `);
  }

  exec() {
    console.log('Invoked exec');
  }

}

function init (args: any[]) {
  return new CliInit(args);
}

export default init;
