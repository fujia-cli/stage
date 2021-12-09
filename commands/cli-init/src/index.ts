/*
 * @Author: fujia
 * @Date: 2021-12-04 10:54:19
 * @LastEditTime: 2021-12-09 23:10:34
 * @LastEditors: fujia(as default)
 * @Description: To initialize a project
 * @FilePath: /stage/commands/cli-init/src/index.ts
 */
import path from 'path';
import { readdir } from 'fs/promises';
import inquirer from 'inquirer';
import userHome from '@fujia/user-home';
import CliCommand from '@fujia/cli-command';
import CliPackage from '@fujia/cli-package';
import log from '@fujia/cli-log';
import fse from 'fs-extra';
import semver from 'semver';
import { spinnerInstance, sleep } from '@fujia/cli-utils';

import getTemplate, { ProjectTemplate } from './getTemplate';
import {
  PROJECT_TYPES,
  PROJECT_OPTIONS,
  COMPONENT_OPTIONS,
} from './constants';
import {
  ProjectType,
  ProjectTypeList,
  ComponentTypeList,
  ProjectInfo
} from './interface';

export class CliInit extends CliCommand {
  projectName: string;
  force: boolean;
  template: ProjectTemplate[];
  projectInfo: ProjectInfo | null;
  constructor(args: any[]) {
    super(args);
    this.projectName = '';
    this.force = false;
    this.template = [];
    this.projectInfo = null;
  }

  init() {
    this.projectName = this.argv[0] || '';
    this.force = !!this.cmd?.force;

    log.verbose('[cli-init]', `
      projectName: ${this.projectName}
      force: ${this.force}
    `);
  }

  async exec() {
    /**
    * NOTE: steps
    *
    * 1, prepare stage
    *
    * 2, download template
    *
    * 3, install template
    */
    try {
      const result = await this.prepare();
      log.verbose('[cli-init]', `
        project info: ${result}
      `);

      if (result) {
        this.projectInfo = result;
        await this.downloadTemplate();
      }
    } catch (err: any) {
      log.error('[cli-init]', err?.message);
    }
  }

  async prepare() {
    /**
    * NOTE: general idea
    *
    * 1, check if the template exists
    *
    * 2, check if the current directory empty
    *
    * 3, whether enable force update
    *
    * 4, select the type of project
    *
    * 5, obtain the info of project
    */
    const template = await getTemplate();

    if (!template.data || template.data.length <= 0) {
      throw new Error('The template doesn\'t exist');
    }
    this.template = template.data;
    const cwdPath = process.cwd();
    const isEmpty = await this.isDirEmpty(cwdPath);

    if (!isEmpty) {
      let continued: boolean | undefined;

      if (!this.force) {
        // NOTE: Inquiry into whether continue creating
        continued = (await inquirer.prompt({
          type: 'confirm',
          name: 'continued',
          default: false,
          message: 'Currently folder is not empty, whether continue?'
        })).continued;

        if (!continued) return null;
      }

      /**
      * NOTE: As we known, the operation of cleanup folder is very dangerous.
      * The best practice is confirmed once more.
      */
      const cleanConfirmed = (await inquirer.prompt({
        type: 'confirm',
        name: 'cleanConfirmed',
        default: false,
        message: 'This operation will cleanup all files in current folder and irrevocable, Please confirm again!'
      })).cleanConfirmed;

      if (cleanConfirmed) {
        await fse.emptyDir(cwdPath);
      }
    }

    return this.getProjectInfo();
  }

  async downloadTemplate() {
    /**
    * NOTE: basic ideas
    *
    * 1, Obtains the template information by the api of project's template
    *   1.1, You may need have a set of api services
    *   1.2, The template can publish to npm
    *   1.3, You can store the template information in databases, such as: mongoDB, MySQL etc.
    *   1.4, Gets the template information by request api services.
    */
    const { projectTemplate } = this.projectInfo!;
    const templateInfo = this.template.find(t => t.npmName === projectTemplate);
    const homeDir = await userHome();

    if (!homeDir) throw new Error('Oops! The user home doesn\'t exist.');

    const localPath = path.resolve(homeDir, '.stage-cli', 'template');
    const storeDir = path.resolve(localPath, 'node_modules');
    const { npmName, version } = templateInfo!;

    const templatePkg = new CliPackage({
      localPath,
      storeDir,
      name: npmName,
      version,
    });
    log.verbose('[cli-init]', `template downloading: {
      localPath: ${localPath},
      storeDir: ${storeDir},
      name: ${npmName},
      version: ${version},
    }`);
    console.log();

    if (!await templatePkg.exist()) {
      const spinner = spinnerInstance('template downloading...');
      // NOTE: if install's speed are quickly, hold on one second!
      await sleep();
      try {
        await templatePkg.install();
        log.success('[cli-init]', 'Downloaded template successful!')
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
      }
      return;
    }

    const spinner = spinnerInstance('template updating...');
    // NOTE: if install's speed are quickly, hold on one second!
    await sleep();
    try {
      await templatePkg.update();
      log.success('[cli-init]', 'Updated template successful!')
    } catch (error) {
      throw error;
    } finally {
      spinner.stop(true);
    }
  }

  async isDirEmpty(curDir: string, ignoreFiles = ['node_modules']) {
    let files = await readdir(curDir);

    files.filter((f) => !f.startsWith('.') && !ignoreFiles.includes(f));
     return files && files.length > 0;
  }

  async getProjectInfo(): Promise<ProjectInfo> {
    const self = this;
    let projectInfo = null;
    const projectType = (await inquirer.prompt({
      type: 'list',
      message: 'Please select the type of initial project',
      name: 'projectType',
      default: 0,
      choices: PROJECT_TYPES
    })).projectType as ProjectType;

    if (projectType === 'project') {
      projectInfo = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Please input name of project',
          default: '',
          validate: function (name) {
            const done = (this as any).async();

            setTimeout(function () {
              if (!self.isValidProjectName(name)) {
                done('Oops! this name is invalid, please re-enter!');
                return;
              }

              done(null, true);
            }, 300);
            // return self.isValidProjectName(name);
          },
          filter: (name) => {
            return name;
          }
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: 'Please input version of project',
          default: '1.0.0',
          validate: function (version){
            const done = (this as any).async();

            setTimeout(function () {
              if (!(!!semver.valid(version))) {
                done('Oops! this version is invalid, please re-enter!');
                return;
              }

              done(null, true);
            }, 300);
          },
          filter: (version) => {
            if (semver.valid(version)) {
              return semver.valid(version);
            }

            return version;
          }
        },
        {
          type: 'list',
          name: 'projectTemplate',
          message: 'Please select one template for the project',
          choices: this.createTemplateChoices(),
        }
      ]);
    } else if (projectType === 'component') {

    }

    return projectInfo;
  }

  createTemplateChoices () {
    return this.template.map(i => ({
      value: i.npmName,
      name: i.name
    }));
  }

  isValidProjectName(name: string) {
    return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(name);
  }
}

function init (args: any[]) {
  return new CliInit(args);
}

export default init;
