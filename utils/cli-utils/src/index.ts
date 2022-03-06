/*
 * @Author: fujia
 * @Date: 2021-12-09 21:31:09
 * @LastEditTime: 2022-03-06 16:38:51
 * @LastEditors: fujia(as default)
 * @Description: An awesome utilities for stage-cli
 * @FilePath: /stage/utils/cli-utils/src/index.ts
 */
import cp, { CommonSpawnOptions, ChildProcess } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Spinner } from 'cli-spinner';
import { NewEnvVariables, NPM_REGISTRY } from './constants';

export {
	NewEnvVariables,
	STAGE_CLI_TEMPLATES_DIR,
	EJS_IGNORE_FILES,
	CUSTOM_TPL_FILE,
	STAGE_CONFIG_FILE,
} from './constants';

export type { StageCliCmd } from './interface';

export function spinnerInstance(message = 'loading...', spinnerString = '|/-\\') {
	const spinner = new Spinner(`${message} %s`);

	spinner.setSpinnerString(spinnerString);
	spinner.start();

	return spinner;
}

export const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

export const isWin32 = process.platform === 'win32';

export const spawn = (
	command: string,
	args: readonly string[],
	options: CommonSpawnOptions,
): ChildProcess => {
	// NOTE: In window OS, it need to execute command by cmd
	const cmd = isWin32 ? 'cmd' : command;
	const cmdArgs = isWin32 ? ['/c'].concat(command, args) : args;

	return cp.spawn(cmd, cmdArgs, options || {});
};

export const spawnAsync = (
	command: string,
	args: readonly string[],
	options: CommonSpawnOptions,
): Promise<number | null> => {
	return new Promise((resolve, reject) => {
		const cp = spawn(command, args, options);

		cp.on('error', (err) => {
			reject(err);
		});

		cp.on('exit', (chunk) => {
			resolve(chunk);
		});
	});
};

export const readFile = (
	path: string,
	options: {
		toJson?: boolean;
	} = {},
) => {
	if (fs.existsSync(path)) {
		const buffer = fs.readFileSync(path);

		if (buffer) {
			if (options.toJson) {
				return buffer.toJSON();
			}

			return buffer.toString();
		}
	}

	return null;
};

export const writeFile = (
	path: string,
	data: string | NodeJS.ArrayBufferView,
	options: {
		rewrite?: boolean;
	} = {
		rewrite: true,
	},
) => {
	if (fs.existsSync(path)) {
		if (options.rewrite) {
			fs.writeFileSync(path, data);

			return true;
		}

		return false;
	}

	fs.writeFileSync(path, data);
	return true;
};

export const isPlainObject = (val: unknown) =>
	Object.prototype.toString.call(val) === '[object Object]';

export const isPrimitive = (val: unknown): boolean =>
	typeof val === 'string' ||
	typeof val === 'number' ||
	typeof val === 'symbol' ||
	typeof val === 'boolean';

export const spreadObjToString = (val: any, prefix?: string) => {
	if (!isPlainObject(val)) return prefix;

	let str = prefix ? `${prefix}: ` : '';
	const keys = Object.keys(val);
	keys.forEach((k) => {
		str += `\n\t${k}: ${val[k]}`;
	});

	return str;
};

export const printErrorStackInDebug = (err: any) => {
	if (process.env[NewEnvVariables.LOG_LEVEL] === 'verbose') {
		console.error(err);
	}
};

export const getCurDirName = (filePath?: string) => {
	const curPath = filePath ? filePath : process.cwd();

	let dirName = '';
	const formatPath = curPath.replace('\\', '/');
	const pathList = formatPath.split('/');

	for (let i = pathList.length - 1; i >= 0; i--) {
		if (pathList[i]) {
			dirName = pathList[i];
			break;
		}
	}

	return dirName;
};

export const readDotFileToObj = <T>(filePath: string) => {
	if (fs.existsSync(filePath)) {
		const dotConfig: Record<string, string> = {};
		const fileToStr = readFile(filePath) as string;

		const configList = fileToStr
			.split(os.EOL)
			.filter((_) => _)
			.map((c) => c.split('='));

		configList.forEach((c) => {
			if (c[0] && c[1]) {
				dotConfig[c[0]] = c[1];
			}
		});

		return dotConfig as Record<keyof T, string>;
	}
};

export const writeSimpleObjToDotFile = <T extends Record<string, any>>(
	filePath: string,
	obj: T,
) => {
	if (!isPlainObject(obj))
		throw new Error(
			'[cli-utils]/writeSimpleObjToDotFile: this method param should be a plain object',
		);

	const keys = Object.keys(obj).filter((i) => isPrimitive(obj[i]));

	let content = '';

	for (let i = 0; i < keys.length; i++) {
		const curKey = keys[i];
		content += `${curKey}=${obj[curKey]}\n`;
	}

	if (!!content) {
		return writeFile(filePath, content);
	}

	console.log('the content is empty string');
	return false;
};

export const genInquirerChoices = (
	strArr: string[],
	extra = [
		{
			name: 're-input',
			value: 're-input',
		},
	],
	max = 6,
) => {
	const formatChoices = strArr
		.map((i) => ({
			name: i,
			value: i,
		}))
		.slice(0, max);

	if (extra.length > 0) {
		return [...formatChoices, ...extra];
	}

	return formatChoices;
};

export const getNpmRegistry = () => {
	const homeDir = process.env[NewEnvVariables.USER_HOME]!;
	const npmRcPath = path.resolve(homeDir, '.npmrc');
	const npmRcObj = readDotFileToObj<{
		registry: string;
	}>(npmRcPath);
	const registry = npmRcObj?.registry || NPM_REGISTRY;

	return registry;
};
