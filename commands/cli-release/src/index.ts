import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';

export class ReleaseCommand extends CliCommand {
  constructor(args: any[]) {
    super(args);
  }

  init() {
    log.verbose('[cli-release]', `init`);
  }

  async exec() {
    try {

    } catch (err: any) {
      log.error('[cli-release]', `err?.message`);
      throw err;
    }
  }
}

function releaseCmd (args: any[]) {
  return new ReleaseCommand(args);
}

export default releaseCmd;
