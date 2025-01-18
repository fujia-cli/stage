import { enhanceLog as log, NewEnvVariables } from '@fujia/stage-share';
import { CliCommand } from '@fujia/stage-models';

export class DeployCommand extends CliCommand {
  constructor(args: any[]) {
    super(args);
  }

  init() {
    log.verbose('[cli-deploy]', 'init');
  }

  async exec() {
    try {
      const stageCliHome = process.env[NewEnvVariables.STAGE_CLI_HOME];

      if (!stageCliHome)
        throw new Error('The stage cli home directory is not exist');
    } catch (err: any) {
      log.error('', `${err?.message}`);
      throw err;
    }
  }
}

export function deployCmd(args: any[]) {
  return new DeployCommand(args);
}
