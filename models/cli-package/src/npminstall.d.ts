/*
 * @Author: fujia
 * @Date: 2021-12-05 08:37:42
 * @LastEditTime: 2021-12-06 13:55:14
 * @LastEditors: fujia(as default)
 * @Description: Add declaration file of npminstall
 * @FilePath: /stage/models/cli-package/src/npminstall.d.ts
 */

interface NpmInstallOptions {
  // by default, process.cwd()
  root?: string;
  // optional packages need to install, default is package.json's dependencies and devDependencies
  pkgs: Array<{
    name: string;
    version: string;
  }>,
  // install to specific directory, default to root
  targetDir?: string;
  // link bin to specific directory (for global install), i.e. '/home/admin/.global/bin'
  binDir?: string;
  // default is https://registry.npmjs.org, or you can set 'https://registry.npmjs.org'
  registry?: string;
  // by default: false
  debug?: boolean;
  // root + 'node_modules'
  storeDir?: string;
  // ignore pre/post install scripts, default is `false`
  ignoreScripts?: boolean;
  // forbid install packages which used these licenses
  forbiddenLicenses?: string[];
}

declare module 'npminstall' {
  export default function npminstall<T = any>(options: NpmInstallOptions): Promise<T>;
}
