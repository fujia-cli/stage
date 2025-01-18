// import inquirer from 'inquirer';
import terminalLink from 'terminal-link';
import semver from 'semver';
import { input, select, password } from '@inquirer/prompts';

import { isValidCommitMsg } from './helper';
import {
  INQUIRE_GIT_PLATFORMS,
  GITHUB,
  REPO_OWNER_USER,
  GIT_OWNER_TYPE,
  GIT_OWNER_TYPE_ONLY,
} from './constants';
import { GitPlatformType } from './interface';

export const inquireGitPlatform = async () =>
  await select<GitPlatformType>({
    message: 'please select the git platform:',
    default: GITHUB,
    choices: INQUIRE_GIT_PLATFORMS,
  });

export const inquireGitToken = async () =>
  await password({
    message: 'please copy your token to here:',
    mask: true,
    validate: (value) => {
      if (value.length < 6) {
        return 'This token is invalid!';
      }
      return true;
    },
    theme: {},
  });

export const inquireRepoOwner = async (orgs: any) =>
  await select({
    message: 'please select remote repository type:',
    default: REPO_OWNER_USER,
    choices: orgs?.length > 0 ? GIT_OWNER_TYPE : GIT_OWNER_TYPE_ONLY,
  });

export const inquireOrg = async (orgs: any) =>
  await select<string>({
    message: 'please select the organization',
    choices: orgs.map((org: { login: string }) => ({
      name: org.login,
      value: org.login,
    })),
  });

const commitLintLink = terminalLink(
  '@commitlint/config-conventional',
  'https://www.npmjs.com/package/@commitlint/config-conventional',
);
export const inquireCommitMessage = async () =>
  await input({
    message: 'please input commit message',
    default: '',
    required: true,
    // transformer

    validate: function (msg: string) {
      if (!isValidCommitMsg(msg)) {
        return `this message is invalid, please consults here: ${commitLintLink} and re-enter`;
      }

      return true;
    },
  });

export const inquireUpgradeVersionType = async (releaseVersion: string) =>
  await select<semver.ReleaseType>({
    message: 'please select the upgrade type for version',
    default: 'patch',
    choices: [
      {
        name: `patch(${releaseVersion} -> ${semver.inc(releaseVersion, 'patch')})`,
        value: 'patch',
      },
      {
        name: `minor(${releaseVersion} -> ${semver.inc(releaseVersion, 'minor')})`,
        value: 'minor',
      },
      {
        name: `major(${releaseVersion} -> ${semver.inc(releaseVersion, 'major')})`,
        value: 'major',
      },
    ],
  });
