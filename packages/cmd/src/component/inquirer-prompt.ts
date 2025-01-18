import { genInquirerChoices } from '@fujia/stage-share';
import { input, select, number } from '@inquirer/prompts';

import { TEMPLATE_TYPE_LIST } from './constants';
// import { ComponentTypeList } from './interface';
import { isValidComponentName } from './helper';

export const inquireSelectTempType = async () =>
  await select({
    message: 'please select a template type:',
    default: 0,
    choices: genInquirerChoices(TEMPLATE_TYPE_LIST, []),
  });

export const inquireComponentName = async () =>
  await input({
    message: 'please input the component name:',
    default: '',
    validate(name: string) {
      if (!isValidComponentName(name)) {
        return 'this component name is invalid, please re-input!';
      }
      return true;
    },
  });
