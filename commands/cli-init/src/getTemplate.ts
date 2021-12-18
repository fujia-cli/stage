import request, { AxiosPromise } from '@fujia/cli-request';

import {
  TemplateType,
  ProjectCategory,
  ProjectTemplate,
  ComponentTemplate
} from './interface';
import {
  DEFAULT_WEB_TEMPLATES,
  DEFAULT_APP_TEMPLATES,
  DEFAULT_LIBRARY_TEMPLATES,
  DEFAULT_MINI_PROGRAM_TEMPLATES,
  DEFAULT_COMPONENT_TEMPLATES,
} from './constants';

const genProjectTemplate = (projectCategory: ProjectCategory) => {
  switch(projectCategory) {
    case 'app':
      return DEFAULT_APP_TEMPLATES;
    case 'library':
      return DEFAULT_LIBRARY_TEMPLATES;
    case 'mini-program':
      return DEFAULT_MINI_PROGRAM_TEMPLATES;
    case 'web':
      return DEFAULT_WEB_TEMPLATES;
    default:
      return [];
  }
}

const fetchProjectTemplate = (): AxiosPromise<ProjectTemplate[]> => {
  return request({
    url: '/project/template'
  });
};

const fetchComponentTemplate = (): AxiosPromise<ComponentTemplate[]> => {
  return request({
    url: '/component/template'
  });
};

const getCustomProjectTemplates = () => {
  return Promise.resolve({
    data: []
  });
};

const getCustomComponentTemplates = () => {
  return Promise.resolve({
    data: []
  });
};

export const getProjectTemplate = (tempType: TemplateType, projectCategory: ProjectCategory): Promise<{
  data: Array<ProjectTemplate>
}> | AxiosPromise<ProjectTemplate[]> => {
  if (tempType === 'remote') {
    return fetchProjectTemplate();
  } else if (tempType === 'custom') {
    return getCustomProjectTemplates();
  } else {
    return Promise.resolve({
      data: genProjectTemplate(projectCategory)
    });
  }
};

export const getComponentTemplate = (tempType: TemplateType): Promise<{
  data: Array<ComponentTemplate>
}> | AxiosPromise<ComponentTemplate[]> => {
  if (tempType === 'remote') {
    return fetchComponentTemplate();
  } else if (tempType === 'custom') {
    return getCustomComponentTemplates();
  } else {
    return Promise.resolve({
      data: DEFAULT_COMPONENT_TEMPLATES
    });
  }
};
