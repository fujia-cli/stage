import inquirer from 'inquirer';
import { genInquirerChoices } from '@fujia/cli-utils';

import { TEMPLATE_TYPE_LIST } from './constants';
import { ComponentTypeList } from './interface';
import { isValidComponentName } from './helper';

export const inquireSelectTempType = async () =>
	inquirer.prompt<{
		templateType: ComponentTypeList;
	}>({
		type: 'list',
		name: 'templateType',
		message: 'please select a template type:',
		default: 0,
		choices: genInquirerChoices(TEMPLATE_TYPE_LIST, []),
	});

export const inquireComponentName = async () =>
	await inquirer.prompt<{
		componentName: string;
	}>([
		{
			type: 'input',
			name: 'componentName',
			message: 'please input the component name:',
			default: '',
			validate(name) {
				const done = (this as any).async();

				setTimeout(function () {
					if (!isValidComponentName(name)) {
						done('this component name is invalid, please re-input!');
						return false;
					}

					done(null, true);
				}, 300);
			},
		},
	]);
