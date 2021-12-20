export interface PkgInfo {
  projectName: string;
  version: string;
  sourceDir: string;
}

export interface PublishCmdOptions {
  refreshRepo?: boolean;
  refreshToken?: boolean;
  refreshOwner?: boolean;
}
