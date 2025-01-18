// import request from '@fujia/stage-share';

import { ProjectCategory, ProjectTemplate } from './interface';
import {
  DEFAULT_WEB_TEMPLATES,
  DEFAULT_APP_TEMPLATES,
  DEFAULT_LIBRARY_TEMPLATES,
  DEFAULT_MINI_PROGRAM_TEMPLATES,
} from './constants';
import { getCustomTplInfo } from './utils';

export const getDefaultTemplates = (projectCategory: ProjectCategory) => {
  let tplList: ProjectTemplate[];

  switch (projectCategory) {
    case 'app':
      tplList = DEFAULT_APP_TEMPLATES;
      break;
    case 'library':
      tplList = DEFAULT_LIBRARY_TEMPLATES;
      break;
    case 'mini-program':
      tplList = DEFAULT_MINI_PROGRAM_TEMPLATES;
      break;
    case 'web':
      tplList = DEFAULT_WEB_TEMPLATES;
      break;
    default:
      tplList = [];
      break;
  }

  return Promise.resolve({
    data: tplList,
  });
};

// const fetchProjectTemplate = async () => {
//   return request({
//     url: '/project/template',
//   });
// };

export const getCustomProjectTemplates = async () => {
  const { pkgList } = await getCustomTplInfo();

  return Promise.resolve({
    data: pkgList,
  });
};

// export const getProjectTemplate = (
// 	tempType: TemplateType,
// 	projectCategory: ProjectCategory,
// ):
// 	| Promise<{
// 			data: Array<ProjectTemplate>;
// 	  }>
// 	| AxiosPromise<ProjectTemplate[]> => {
// 	if (tempType === 'remote') {
// 		return fetchProjectTemplate();
// 	} else if (tempType === 'custom') {
// 		return getCustomProjectTemplates();
// 	} else {
// 		return Promise.resolve({
// 			data: getDefaultTemplate(projectCategory),
// 		});
// 	}
// };
