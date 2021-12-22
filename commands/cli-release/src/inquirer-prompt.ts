import inquirer from 'inquirer';
import semver from 'semver';

export type UpgradeVersionType = 'major' | 'minor' | 'patch' | 'prerelease';

export const inquireUpgradeVersionType = async (releaseVersion: string) => await inquirer.prompt<{
  upgradeType: UpgradeVersionType
}>({
  type: 'list',
  name: 'upgradeType',
  message: 'please select the version upgrade type:',
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
    {
      name: `prerelease(${releaseVersion} -> ${semver.inc(releaseVersion, 'prerelease')})`,
      value: 'prerelease'
    },
  ]
});
