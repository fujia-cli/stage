export const CMD_MAP_PACKAGE: CmdMapPackage = {
  init: '@fujia/cli-init',
  publish: '@fujia/cli-publish'
};

type CmdMapPackage = {
  [key: string]: unknown
}
