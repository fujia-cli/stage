import { readdir } from 'fs/promises';

import {
  WHITE_COMMANDS,
} from './constants';
import { ProjectTemplate, ComponentTemplate } from './interface';

export const verifyCmd = (cmd: string) => {
  return WHITE_COMMANDS.includes(cmd) ? cmd : null;
}

export const createTemplateChoices = (temps: Array<ProjectTemplate | ComponentTemplate>) => {
  if (!Array.isArray(temps)) return [];

  return temps.map(i => ({
    value: i.npmName,
    name: i.name
  }));
}

export const isValidProjectName = (name: string) => {
  return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(name);
}

export const isDirEmpty = async (curDir: string, ignoreFiles = ['node_modules']) => {
  let files = await readdir(curDir);

  files.filter((f) => !f.startsWith('.') && !ignoreFiles.includes(f));
   return files && files.length > 0;
}
