import { Command } from 'commander';

export interface StageCliHome {
  home: string;
  stageCliHome?: string;
}

export interface StageCliCmd extends Command {
  debug?: boolean;
  localPath?: string; // specify the local debug file path
  refreshRepo?: boolean; // force to update the remote Git repository
  refreshToken?: boolean; // force to update the token of remote repository
  refreshOwner?: boolean; // force to update the type of remote repository
}

