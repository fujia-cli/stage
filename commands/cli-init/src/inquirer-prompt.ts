import inquirer from 'inquirer';
import semver from 'semver';
import { getCurDirName, genInquirerChoices } from '@fujia/cli-utils';

import { TemplateType, ProjectType, ProjectTemplate, ProjectCategory } from './interface';
import { createTemplateChoices, isValidProjectName } from './utils';
import { TEMPLATE_TYPES, PROJECT_TYPES, INQUIRE_PROJECTS, ADD_CUSTOM_TPL_TEXT } from './constants';

export const inquireTemplateType = async () =>
	await inquirer.prompt<{
		templateType: TemplateType;
	}>({
		type: 'list',
		name: 'templateType',
		default: 0,
		message: 'Please select the template type:',
		choices: TEMPLATE_TYPES,
	});

export const inquireProjectType = async () =>
	await inquirer.prompt<{
		projectType: ProjectType;
	}>({
		type: 'list',
		name: 'projectType',
		default: 0,
		message: 'Please select the project type:',
		choices: PROJECT_TYPES,
	});

export const inquireProjectCategory = async () =>
	await inquirer.prompt<{
		projectCategory: ProjectCategory;
	}>({
		type: 'list',
		name: 'projectCategory',
		default: 0,
		message: 'Please select the application category:',
		choices: INQUIRE_PROJECTS,
	});

export const inquireCleanContinued = async () =>
	await inquirer.prompt({
		type: 'confirm',
		name: 'continued',
		default: false,
		message: 'The current folder is not empty, whether to continue?',
	});

export const inquireCleanConfirmed = async () =>
	await inquirer.prompt({
		type: 'confirm',
		name: 'cleanConfirmed',
		default: false,
		message:
			'This operation will clean all files in the current folder and is irrevocable, Please confirm again!',
	});

export const inquireProjectInfo = async (temps: ProjectTemplate[], initProjectName?: string) => {
	const curCwdName = getCurDirName();
	const promptList: any[] = [
		{
			type: 'input',
			name: 'version',
			message: 'Please input the project version:',
			default: '0.1.0',
			validate: function (version: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!!!semver.valid(version)) {
						done('Oops! this version is invalid, please re-enter!');
						return;
					}

					done(null, true);
				}, 300);
			},
			filter: (version: string) => {
				if (semver.valid(version)) {
					return semver.valid(version);
				}

				return version;
			},
		},
	];

	if (Array.isArray(temps) && temps.length >= 1) {
		promptList.push({
			type: 'list',
			name: 'projectTemplate',
			message: 'Please select one template for the project:',
			choices: createTemplateChoices(temps),
		});
	}

	if (!initProjectName || !isValidProjectName(initProjectName)) {
		promptList.unshift({
			type: 'input',
			name: 'projectName',
			message: 'Please input the project name:',
			default: curCwdName,
			validate: function (name: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!isValidProjectName(name)) {
						done('Oops! this name is invalid, please re-enter!');
						return;
					}

					done(null, true);
				}, 300);
				// return self.isValidProjectName(name);
			},
			filter: (name: string) => {
				return name;
			},
		});
	}

	return await inquirer.prompt<{
		projectName?: string;
		version: string;
		projectTemplate?: string;
	}>(promptList);
};

export const inquireNewCustomTpl = async () =>
	await inquirer.prompt<{
		isNewTpl: boolean;
	}>({
		type: 'confirm',
		name: 'isNewTpl',
		message: 'there is no custom template, whether to create one now:',
	});

export const inquireCustomTplInfo = async () =>
	await inquirer.prompt<ProjectTemplate>([
		{
			type: 'input',
			name: 'name',
			message: 'please input template name:',
			validate: function (name: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!isValidProjectName(name)) {
						done('Oops! this name is invalid, please re-enter!');
						return;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'npmName',
			message: 'please input the template corresponding package name:',
			validate: function (name: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!isValidProjectName(name)) {
						done('Oops! this package name is invalid, please re-enter!');
						return;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'version',
			message: 'please input the template version:',
			default: 'latest',
			validate: function (version: string) {
				const done = (this as any).async();

				setTimeout(() => {
					if (version === 'latest') {
						done(null, true);
						return;
					}

					if (!semver.valid(version)) {
						done('Oops! this version is invalid, please re-enter!');
						return;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'installCommand',
			message: 'please input template install command:',
			default: 'npm install',
			validate: function (installCommand: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!installCommand) {
						done('the install command of template can not be empty!');
						return;
					}

					done(null, true);
				}, 300);
			},
		},
		{
			type: 'input',
			name: 'startCommand',
			message: 'please input template start command:',
			default: 'npm start',
			validate: function (startCommand: string) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!startCommand) {
						done('the start command of template can not be empty!');
						return;
					}

					done(null, true);
				}, 300);
			},
		},
	]);

export const inquireSelectTplName = async (tplList: string[]) =>
	await inquirer.prompt<{
		tplName: string;
	}>({
		type: 'list',
		name: 'tplName',
		message: 'please select a mirror service by mirror name or re-input:',
		choices: genInquirerChoices(
			tplList,
			[
				{
					name: ADD_CUSTOM_TPL_TEXT,
					value: ADD_CUSTOM_TPL_TEXT,
				},
			],
			24,
		),
	});
