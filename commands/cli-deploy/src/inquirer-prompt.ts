import path from 'path';
import inquirer from 'inquirer';
import fse from 'fs-extra';

import {
	APP_CATEGORIES,
	DEPLOY_TYPES,
	DATABASE_TYPES,
	userNameRe,
	ip4Re,
	ip6Re,
} from './constants';
import {
	AppCategory,
	ServerInfo,
	ContainerMirrorServiceInfo,
	DatabaseType,
	DeployType,
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

export const inquireContainerMirrorServiceInfo = async () => {
	const cwdPath = process.cwd();
	const pkgJsonPath = path.resolve(cwdPath, 'package.json');
	const pkgDetail = fse.readJSONSync(pkgJsonPath);

	const { name, version } = pkgDetail;

	return await inquirer.prompt<ContainerMirrorServiceInfo>([
		{
			type: 'input',
			name: 'owner',
			message: 'please input the mirror service owner:',
			default: '',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!userNameRe.test(val)) {
						done(`the ${val} is not a valid owner, please re-input!`);
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
			name: 'repoName',
			message: 'please input the mirror service repo name:',
			default: '',
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!val) {
						done('the repo name can not be empty, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
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
		{
			type: 'input',
			name: 'mirrorVersion',
			message: 'please input build mirror version:',
			default: version,
			validate(val: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!val) {
						done('the mirror version can not be empty, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
	]);
};

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
