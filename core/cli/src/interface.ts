import { Command } from 'commander';

export interface StageCliHome {
  home: string;
  stageCliHome?: string;
}

export interface StageCli extends Command {
  debug?: boolean;
  localPath?: string; // specify the local debug file path
}

// NOTE: List all added env variable
export const enum NewEnvVariables {
  STAGE_CLI_LOCAL = 'STAGE_CLI_LOCAL',
  LOG_LEVEL = 'LOG_LEVEL',
  STAGE_CLI_HOME = 'STAGE_CLI_HOME'
}
