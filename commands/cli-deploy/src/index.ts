import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';

export class DeployCommand extends CliCommand {
  constructor(args: any[]) {
    super(args);
  }

  init() {
    log.verbose('[cli-clean]', `init`);
  }

  async exec() {
    try {

    } catch (err: any) {
      log.error('[cli-deploy]', `err?.message`);
      throw err;
    }
  }
}

function deployCmd (args: any[]) {
  return new DeployCommand(args);
}

export default deployCmd;
