import { readdir } from 'fs/promises';
import path from 'path';
import fse from 'fs-extra';
import { NewEnvVariables, CUSTOM_TPL_FILE } from '@fujia/cli-utils';
import log from '@fujia/cli-log';

import { WHITE_COMMANDS } from './constants';
import { ProjectTemplate, CustomPkgInfoJson } from './interface';

export const verifyCmd = (cmd: string) => {
	return WHITE_COMMANDS.includes(cmd) ? cmd : null;
};

export const createTemplateChoices = (temps: Array<ProjectTemplate>) => {
	if (!Array.isArray(temps)) return [];

	return temps.map((i) => ({
		value: i.npmName,
		name: i.name,
	}));
};

export const isValidProjectName = (name: string) => {
	const nameReg = /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;
	const nameByOrgReg =
		/^\@[a-zA-Z]+\/([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;

	return nameReg.test(name) || nameByOrgReg.test(name);
};

export const isDirEmpty = async (curDir: string, ignoreFiles = ['node_modules']) => {
	let files = await readdir(curDir);

	const fileList = files.filter((f) => !f.startsWith('.') && !ignoreFiles.includes(f));
	return fileList.length <= 0;
};

const stageHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
const customTplFile = path.resolve(stageHome, CUSTOM_TPL_FILE);
export const getCustomTplInfo = async () => {
	const customTplInfo: CustomPkgInfoJson = await fse.readJson(customTplFile);

	return customTplInfo;
};

export const writeCustomTplToJson = async (obj = {}, filePath = customTplFile) => {
	await fse.writeJSON(customTplFile, obj);

	log.success('', `write the content into the ${filePath} file successfully`);
};
