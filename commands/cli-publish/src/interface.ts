export interface PkgInfo {
  name: string;
  version: string;
  cwd: string;
}

export interface PublishCmdOptions {
  refreshRepo?: boolean;
  refreshToken?: boolean;
  refreshOwner?: boolean;
}
