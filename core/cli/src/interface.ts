import { Command } from 'commander';

export interface IArgs {
  [key: string]: any;
  debug?: boolean;
}
export interface StageCliHome {
  home: string;
  stageCliHome?: string;
}

export interface StageCli extends Command {
  debug?: boolean;
}
