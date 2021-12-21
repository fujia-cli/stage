import inquirer from 'inquirer';
import semver from 'semver';

import {
  TemplateType,
  ProjectType,
  ProjectTemplate,
  ComponentTemplate,
  ProjectCategory,
} from './interface';
import {
  createTemplateChoices,
  isValidProjectName,
} from './utils';
import { TEMPLATE_TYPES, PROJECT_TYPES, INQUIRE_PROJECTS } from './constants';

export const inquireTemplateType = async () => await inquirer.prompt<{
  templateType: TemplateType
}>({
  type: 'list',
  name: 'templateType',
  default: 0,
  message: 'Please select the template type: ',
  choices: TEMPLATE_TYPES
});

export const inquireProjectType = async () => await inquirer.prompt<{
  projectType: ProjectType
}>({
  type: 'list',
  name: 'projectType',
  default: 0,
  message: 'Please select the project type: ',
  choices: PROJECT_TYPES
});

export const inquireProjectCategory = async () => await inquirer.prompt<{
  projectCategory: ProjectCategory
}>({
  type: 'list',
  name: 'projectCategory',
  default: 0,
  message: 'Please select the application category: ',
  choices: INQUIRE_PROJECTS
});


export const inquireCleanContinued = async () => await inquirer.prompt({
  type: 'confirm',
  name: 'continued',
  default: false,
  message: 'The current folder is not empty, whether to continue?'
});

export const inquireCleanConfirmed = async () => await inquirer.prompt({
  type: 'confirm',
  name: 'cleanConfirmed',
  default: false,
  message: 'This operation will clean all files in the current folder and is irrevocable, Please confirm again!'
});

export const inquireProjectInfo = async (temps: ProjectTemplate[]) => await inquirer.prompt([
  {
    type: 'input',
    name: 'projectName',
    message: 'Please input the project name: ',
    default: '',
    validate: function (name) {
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
    filter: (name) => {
      return name;
    }
  },
  {
    type: 'input',
    name: 'version',
    message: 'Please input the project version: ',
    default: '0.1.0',
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
    message: 'Please select one template for the project: ',
    choices: createTemplateChoices(temps),
  }
]);

export const inquireComponentInfo = async (temps: ComponentTemplate[]) => await inquirer.prompt([
  {
    type: 'input',
    name: 'componentName',
    message: 'Please input the component name: ',
    default: '',
    validate: function (name) {
      const done = (this as any).async();

      setTimeout(function () {
        if (!isValidProjectName(name)) {
          done('Oops! this name is invalid, please re-enter!');
          return;
        }

        done(null, true);
      }, 300);
      // return self.isValidProjectName(name);
    }
  },
  {
    type: 'list',
    name: 'componentTemplate',
    message: 'Please select one template for the component: ',
    choices: createTemplateChoices(temps),
  }
]);
