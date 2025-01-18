import semver from 'semver';
import { genInquirerChoices } from '@fujia/stage-share';
import { select, input } from '@inquirer/prompts';

import {
  APP_CATEGORIES,
  DEPLOY_TYPES,
  DATABASE_TYPES,
  userNameRe,
  ip4Re,
  ip6Re,
  UPGRADE_VERSION_CHOICES,
} from './constants';
import {
  AppCategory,
  ServerInfo,
  ContainerMirrorServiceInfo,
  DatabaseType,
  DeployType,
  UpgradeVersionType,
} from './interface';
import { getCwdProjectPackageJson } from './helper';

export const inquireAppCategory = async () =>
  await select({
    message: 'please select the app category:',
    default: 0,
    choices: APP_CATEGORIES,
  });

export const inquireServerInfo = async () => {
  const userName = await input({
    message: 'please input the server username:',
    default: '',
    validate(val: string) {
      if (!userNameRe.test(val)) {
        return `the ${val} is not a valid username, please re-input!`;
      }
      return true;
    },
  });

  const sshPort = await input({
    message: 'please input the ssh login port:',
    default: '22',
    validate(val: string) {
      const numericalVal = Number(val);
      if (numericalVal <= 0 || numericalVal > 65535) {
        return 'the ssh port should less than 65536, please re-input!';
      }

      return true;
    },
  });

  const serverIP = await input({
    message: 'please input the server ip address:',
    default: '',
    validate(val: string) {
      if (!ip4Re.test(val) && !ip6Re.test(val)) {
        return `the ${val} is not valid, please re-input!`;
      }

      return true;
    },
  });

  return {
    userName,
    sshPort,
    serverIP,
  };
};

// const genChoices = (
// 	strArr: string[],
// 	extra = [
// 		{
// 			name: 're-input',
// 			value: 're-input',
// 		},
// 	],
// 	max = 6,
// ) => {
// 	const formatChoices = strArr
// 		.map((i) => ({
// 			name: i,
// 			value: i,
// 		}))
// 		.slice(0, max);

// 	if (extra.length > 0) {
// 		return [...formatChoices, ...extra];
// 	}

// 	return formatChoices;
// };
export const inquireSelectServerIp = async (ipList: string[]) =>
  select({
    message: 'please select a server info by IP or re-input:',
    default: 0,
    choices: genInquirerChoices(ipList),
  });

const genMirrorVersionChoices = (version: string) =>
  UPGRADE_VERSION_CHOICES.map((t) => {
    const curVersion = semver.inc(version, t as UpgradeVersionType);

    return {
      name: `${t}(${version} -> ${curVersion})`,
      value: curVersion,
    };
  });

export const inquireUpgradeMirrorVersion = async () => {
  /**
   * NOTE: It's not certain that the project is an npm project.
   */
  const { version } = getCwdProjectPackageJson() || {};

  if (version) {
    return await select({
      message: 'please select build mirror version:',
      default: 0,
      choices: genMirrorVersionChoices(version),
    });
  }

  return await input({
    message: 'please input build mirror version:',
    default: '0.1.0',
    required: true,
    validate(val: string) {
      if (!semver.valid(val)) {
        return 'the version is illegal, please re-input!';
      }

      return true;
    },
  });
};

export const inquireContainerMirrorServiceInfo = async () => {
  const { name } = getCwdProjectPackageJson() || {};

  const owner = await input({
    message: 'please input the mirror service owner:',
    default: '',
    validate(val: string) {
      if (!val) {
        return 'the owner can not be empty, please re-input!';
      }

      return true;
    },
  });

  const userPwd = await input({
    message: 'please input the mirror service login password:',
    default: '',
    validate(val: string) {
      if (!val) {
        return 'the password can not be empty, please re-input!';
      }

      return true;
    },
  });

  const mirrorName = await input({
    message: 'please input build mirror name:',
    default: name,
    validate(val: string) {
      if (!val) {
        return 'the mirror name can not be empty, please re-input!';
      }

      return true;
    },
  });

  const repoZone = await input({
    message: 'please input the mirror service repo zone:',
    default: '',
    validate(val: string) {
      if (!val) {
        return 'the repo zone can not be empty, please re-input!';
      }
      return true;
    },
  });

  const repoNamespace = await input({
    message: 'please input the mirror service repo namespace:',
    default: '',
    validate(val: string) {
      if (!val) {
        return 'the repo namespace can not be empty, please re-input!';
      }

      return true;
    },
  });

  return {
    owner,
    userPwd,
    mirrorName,
    repoZone,
    repoNamespace,
  };
};

export const inquireSelectMirrorName = async (mirrorNameList: string[]) =>
  await select({
    message: 'please select a mirror service by mirror name or re-input:',
    choices: genInquirerChoices(mirrorNameList),
  });

export const inquireDatabaseType = async () =>
  await select({
    message: 'please the database type:',
    default: 0,
    choices: DATABASE_TYPES,
  });

export const inquireDeployType = async () =>
  await select({
    message: 'please select the deploy type:',
    default: 0,
    choices: DEPLOY_TYPES,
  });

export const inquireServiceName = async () =>
  await input({
    message: 'please input the service name:',
    default: '',
    validate(name) {
      if (!name) {
        return 'the service name can not be empty, please re-input!';
      }

      return true;
    },
  });

export const inquireSelectServiceName = async (serviceNameList: string[]) =>
  await select({
    message: 'please select a service name or re-input:',
    choices: genInquirerChoices(serviceNameList),
  });
