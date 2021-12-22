import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import { NewEnvVariables } from '@fujia/cli-utils';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';

export class CleanCommand extends CliCommand {
  cacheDir: string;
  constructor(args: any[]) {
    super(args);
    this.cacheDir = '';
  }

  init() {
    log.verbose('[cli-clean]', `init: ${this.argv.join(', ')}`);
    this.cacheDir = this.argv[0] || '';
  }

  async exec() {
    try {
      const stageCliHome = process.env[NewEnvVariables.STAGE_CLI_HOME];

      if (!stageCliHome) throw new Error('The stage cli home directory is not exist');

      const cachesDir = path.resolve(stageCliHome, 'caches');
      const templateCacheDir = path.resolve(stageCliHome, 'templates');

      if (this.cacheDir === 'caches' && pathExistSync(cachesDir)) {
        await fse.emptyDir(cachesDir);
      } else if (this.cacheDir === 'templates' && pathExistSync(templateCacheDir)) {
        await fse.emptyDir(templateCacheDir);
      } else {
        pathExistSync(cachesDir) && (await fse.emptyDir(cachesDir));
        pathExistSync(templateCacheDir) && (await fse.emptyDir(templateCacheDir));
      }
    } catch (err: any) {
      log.error('[cli-clean]', `err?.message`);
      throw err;
    }
  }
}

function cleanCmd (args: any[]) {
  return new CleanCommand(args);
}

export default cleanCmd;
