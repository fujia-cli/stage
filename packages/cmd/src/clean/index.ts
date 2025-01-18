import path from 'path';
import { CliCommand } from '@fujia/stage-models';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';
import { enhanceLog as log, NewEnvVariables } from '@fujia/stage-share';

export class CleanCommand extends CliCommand {
  cacheDir: string;
  constructor(args: any[]) {
    super(args);
    this.cacheDir = '';
  }

  init() {
    log.verbose('[cli-clean]', `cache directory: ${this.argv[0]}`);
    this.cacheDir = this.argv[0] || '';
  }

  async exec() {
    try {
      const stageCliHome = process.env[NewEnvVariables.STAGE_CLI_HOME];

      if (!stageCliHome)
        throw new Error('The stage cli home directory is not exist');

      const cachesDir = path.resolve(stageCliHome, 'caches');
      const templateCacheDir = path.resolve(stageCliHome, 'templates');

      if (!this.cacheDir) {
        log.info(
          '',
          `starting to clean cached directories: ${cachesDir}, ${templateCacheDir}`,
        );

        pathExistSync(cachesDir) && (await fse.emptyDir(cachesDir));
        pathExistSync(templateCacheDir) &&
          (await fse.emptyDir(templateCacheDir));
      } else {
        const specificDir = path.resolve(stageCliHome, this.cacheDir);
        log.info('', `starting to clean the directory: ${specificDir}`);

        pathExistSync(specificDir) && (await fse.emptyDir(specificDir));
      }
    } catch (err: any) {
      log.error('', `${err?.message}`);
      throw err;
    }
  }
}

export function cleanCmd(args: any[]) {
  return new CleanCommand(args);
}
