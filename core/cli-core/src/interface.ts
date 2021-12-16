import { Command } from 'commander';

export interface StageCliHome {
  home: string;
  stageCliHome?: string;
}

export interface StageCliCmd extends Command {
  debug?: boolean;
  localPath?: string; // specify the local debug file path
}

