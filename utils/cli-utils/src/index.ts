/*
 * @Author: fujia
 * @Date: 2021-12-09 21:31:09
 * @LastEditTime: 2021-12-20 14:42:19
 * @LastEditors: fujia(as default)
 * @Description: An awesome utilities for stage-cli
 * @FilePath: /stage/utils/cli-utils/src/index.ts
 */
import cp, { CommonSpawnOptions, ChildProcess, SpawnOptions } from 'child_process';
import fs from 'fs';
import { Spinner } from 'cli-spinner';

export { NewEnvVariables } from './constants';

export function spinnerInstance(message = 'loading...', spinnerString = '|/-\\') {
  const spinner = new Spinner(`${message} %s`);

  spinner.setSpinnerString(spinnerString);
  spinner.start();

  return spinner;
}

export const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const spawn = (command: string, args: readonly string[], options: CommonSpawnOptions): ChildProcess => {
  const isWin32 = process.platform === 'win32';

  // NOTE: In window OS, it need to execute command by cmd
  const cmd = isWin32 ? 'cmd' : command;
  const cmdArgs = isWin32 ? ['/c'].concat(command, args) : args;

  return cp.spawn(cmd, cmdArgs, options || {});
};

export const spawnAsync = (
  command: string,
  args: readonly string[],
  options: CommonSpawnOptions
): Promise<number | null> => {
  return new Promise((resolve, reject) => {
    const cp = spawn(command, args, options);

    cp.on('error', err => {
      reject(err);
    });

    cp.on('exit', chunk => {
      resolve(chunk);
    });
  })
};

export const readFile = (path: string, options : {
  toJson?: boolean
} = {}) => {
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
    rewrite?: boolean
  } = {
    rewrite: true,
  }
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

export const isPlainObject = (val: unknown) => Object.prototype.toString.call(val) === '[object Object]';

export const spreadObjToString = (val: any, prefix?: string) => {
  if (!isPlainObject(val)) return prefix;

  let str = prefix ? `${prefix}: ` : '';
  const keys = Object.keys(val);
  keys.forEach(k => {
    str += `\n\t${k}: ${val[k]}`
  });

  return str;
};


