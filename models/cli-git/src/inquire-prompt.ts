import inquirer from 'inquirer';
import terminalLink from 'terminal-link';
import semver from 'semver';

import { GitPlatformType, UpgradeVersionType } from './interface';
import { isValidCommitMsg } from './helper';
import {
  INQUIRE_GIT_PLATFORMS,
  GITHUB,
  REPO_OWNER_USER,
  GIT_OWNER_TYPE,
  GIT_OWNER_TYPE_ONLY
} from './constants';

export const inquireGitPlatform = async () => await inquirer.prompt<{
  gitType: GitPlatformType,
}>({
  type: 'list',
  name: 'gitType',
  message: 'please select the git platform:',
  default: GITHUB,
  choices: INQUIRE_GIT_PLATFORMS,
});

export const inquireGitToken = async () => await inquirer.prompt<{
  token: string
}>({
  type: 'password',
  name: 'token',
  message: 'please copy your token to here:',
  default: '',
});

export const inquireRepoOwner = async (orgs: any) => await inquirer.prompt<{
  owner: string
}>({
  type: 'list',
  name: 'owner',
  message: 'please select remote repository type:',
  default: REPO_OWNER_USER,
  choices: orgs?.length > 0 ? GIT_OWNER_TYPE : GIT_OWNER_TYPE_ONLY
});

export const inquireOrg = async (orgs: any) => await inquirer.prompt<{
  login: string
}>({
  type: 'list',
  name: 'login',
  message: 'please select the organization',
  choices: orgs.map((org: any) => ({
    name: org.login,
    value: org.login,
  })),
});

const commitLintLink = terminalLink('@commitlint/config-conventional', 'https://www.npmjs.com/package/@commitlint/config-conventional');
export const inquireCommitMessage = async () => await inquirer.prompt<{
  message: string;
}>([{
  type: 'input',
  name: 'message',
  message: 'please input commit message',
  default: '',
  validate: function(msg) {
    const done = (this as any).async();

    setTimeout(function () {
      if (!isValidCommitMsg(msg)) {
        done(`this message is invalid, please consults here: ${commitLintLink} and re-enter`);
        return false;
      }

      done(null, true);
    }, 300);
  }
}]);

export const inquireUpgradeVersionType = async (releaseVersion: string) => await inquirer.prompt<{
  upgradeType: UpgradeVersionType
}>({
  type: 'list',
  name: 'upgradeType',
  message: 'please select the upgrade type for version',
  default: 'patch',
  choices: [
    {
      name: `patch(${releaseVersion} -> ${semver.inc(releaseVersion, 'patch')})`,
      value: 'patch'
    },
    {
      name: `minor(${releaseVersion} -> ${semver.inc(releaseVersion, 'minor')})`,
      value: 'minor'
    },
    {
      name: `major(${releaseVersion} -> ${semver.inc(releaseVersion, 'major')})`,
      value: 'major'
    },
  ]
});
