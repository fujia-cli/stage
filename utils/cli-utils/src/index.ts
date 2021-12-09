/*
 * @Author: fujia
 * @Date: 2021-12-09 21:31:09
 * @LastEditTime: 2021-12-09 22:57:37
 * @LastEditors: fujia(as default)
 * @Description: An awesome utilities for stage-cli
 * @FilePath: /stage/utils/cli-utils/src/index.ts
 */
import { Spinner } from 'cli-spinner';

export function spinnerInstance(message = 'loading...', spinnerString = '|/-\\') {
  const spinner = new Spinner(`${message} %s`);

  spinner.setSpinnerString(spinnerString);
  spinner.start();

  return spinner;
}

export const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));
