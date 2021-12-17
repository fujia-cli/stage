/*
 * @Author: fujia
 * @Date: 2021-12-09 21:31:09
 * @LastEditTime: 2021-12-16 16:32:58
 * @LastEditors: fujia(as default)
 * @Description: An awesome utilities for stage-cli
 * @FilePath: /stage/utils/cli-utils/src/index.ts
 */
import cp, { CommonSpawnOptions, ChildProcess, SpawnOptions } from 'child_process';
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

