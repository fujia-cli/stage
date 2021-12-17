import request, { AxiosPromise } from '@fujia/cli-request';

import { TemplateType, ProjectType, ProjectTemplate, ComponentTemplate } from './interface';
import { DefaultComponentTemplate, DefaultProjectTemplate } from './constants';

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

export const getProjectTemplate = (tempType: TemplateType): Promise<{
  data: Array<ProjectTemplate>
}> | AxiosPromise<ProjectTemplate[]> => {
  if (tempType === 'default') {
    return Promise.resolve({
      data: DefaultProjectTemplate
    });
  } else if (tempType === 'custom') {
    return getCustomProjectTemplates();
  } else {
    return fetchProjectTemplate();
  }
};

export const getComponentTemplate = (tempType: TemplateType): Promise<{
  data: Array<ComponentTemplate>
}> | AxiosPromise<ComponentTemplate[]> => {
  if (tempType === 'default') {
    return Promise.resolve({
      data: DefaultComponentTemplate
    });
  } else if (tempType === 'custom') {
    return getCustomComponentTemplates();
  } else {
    return fetchComponentTemplate();
  }
};
