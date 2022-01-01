import path from 'path';
import inquirer from 'inquirer';
import fse from 'fs-extra';
import semver from 'semver';
import { genInquirerChoices } from '@fujia/cli-utils';

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

export const inquireAppCategory = async () =>
	await inquirer.prompt<{
		appCategory: AppCategory;
	}>({
		type: 'list',
		name: 'appCategory',
		message: 'please select the app category:',
		default: 0,
		choices: APP_CATEGORIES,
	});

export const inquireServerInfo = async () =>
	await inquirer.prompt<ServerInfo>([
		{
			type: 'input',
			name: 'userName',
			message: 'please input the server username:',
			default: '',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!userNameRe.test(val)) {
						done(`the ${val} is not a valid username, please re-input!`);
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'sshPort',
			message: 'please input the ssh login port:',
			default: '22',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					const numericalVal = Number(val);
					if (numericalVal <= 0 || numericalVal > 65535) {
						done('the ssh port should less than 65536, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'serverIP',
			message: 'please input the server ip address:',
			default: '',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!ip4Re.test(val) && !ip6Re.test(val)) {
						done(`the ${val} is not valid, please re-input!`);
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
	]);

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
	inquirer.prompt<{
		serverIp: string;
	}>({
		type: 'list',
		name: 'serverIp',
		message: 'please select a server info by IP or re-input:',
		default: 0,
		choices: genInquirerChoices(ipList),
	});

export const getCwdProjectPackageJson = () => {
	const cwdPath = process.cwd();
	const pkgJsonPath = path.resolve(cwdPath, 'package.json');
	const pkgDetail = fse.readJSONSync(pkgJsonPath);

	return pkgDetail;
};

const genMirrorVersionChoices = (version: string) =>
	UPGRADE_VERSION_CHOICES.map((t) => {
		const curVersion = semver.inc(version, t as UpgradeVersionType);

		return {
			name: `${t}(${version} -> ${curVersion})`,
			value: curVersion,
		};
	});
export const inquireUpgradeMirrorVersion = async () => {
	const { version } = getCwdProjectPackageJson();

	return await inquirer.prompt<{
		mirrorVersion: string;
	}>({
		type: 'list',
		name: 'mirrorVersion',
		message: 'please select build mirror version:',
		default: 0,
		choices: genMirrorVersionChoices(version),
	});
};

export const inquireContainerMirrorServiceInfo = async () => {
	const { name } = getCwdProjectPackageJson();

	return await inquirer.prompt<ContainerMirrorServiceInfo>([
		{
			type: 'input',
			name: 'owner',
			message: 'please input the mirror service owner:',
			default: '',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!val) {
						done('the owner can not be empty, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'userPwd',
			message: 'please input the mirror service login password:',
			default: '',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!val) {
						done('the password can not be empty, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'mirrorName',
			message: 'please input build mirror name:',
			default: name,
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!val) {
						done('the mirror name can not be empty, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
		// {
		// 	type: 'input',
		// 	name: 'repoName',
		// 	message: 'please input the mirror service repo name:',
		// 	default: '',
		// 	validate(val: string) {
		// 		const done = (this as any).async();

		// 		setTimeout(function () {
		// 			if (!val) {
		// 				done('the repo name can not be empty, please re-input!');
		// 				return false;
		// 			}

		// 			done(null, true);
		// 		}, 300);
		// 	},
		// },
		{
			type: 'input',
			name: 'repoZone',
			message: 'please input the mirror service repo zone:',
			default: '',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!val) {
						done('the repo zone can not be empty, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'repoNamespace',
			message: 'please input the mirror service repo namespace:',
			default: '',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!val) {
						done('the repo namespace can not be empty, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
	]);
};

export const inquireSelectMirrorName = async (mirrorNameList: string[]) =>
	await inquirer.prompt<{
		mirrorName: string;
	}>({
		type: 'list',
		name: 'mirrorName',
		message: 'please select a mirror service by mirror name or re-input:',
		choices: genInquirerChoices(mirrorNameList),
	});

export const inquireDatabaseType = async () =>
	await inquirer.prompt<{
		databaseType: DatabaseType;
	}>({
		type: 'list',
		name: 'databaseType',
		message: 'please the database type:',
		default: 0,
		choices: DATABASE_TYPES,
	});

export const inquireDeployType = async () =>
	await inquirer.prompt<{
		deployType: DeployType;
	}>({
		type: 'list',
		name: 'deployType',
		message: 'please select the deploy type:',
		default: 0,
		choices: DEPLOY_TYPES,
	});

export const inquireServiceName = async () =>
	await inquirer.prompt<{
		serviceName: string;
	}>([
		{
			type: 'input',
			name: 'serviceName',
			message: 'please input the service name:',
			default: '',
			validate(name) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!name) {
						done('the service name can not be empty, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
	]);

export const inquireSelectServiceName = async (serviceNameList: string[]) =>
	await inquirer.prompt<{
		serviceName: string;
	}>({
		type: 'list',
		name: 'serviceName',
		message: 'please select a service name or re-input:',
		choices: genInquirerChoices(serviceNameList),
	});
