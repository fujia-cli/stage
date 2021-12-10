import request, { AxiosPromise } from '@fujia/cli-request';

export interface ProjectTemplate {
  _id: string;
  name: string;
  version: string;
  npmName: string;
  type: 'normal' | 'custom';
  installCommand: string;
  startCommand: string;
}

const getTemplate = (): AxiosPromise<ProjectTemplate[]> => {
  return request({
    url: '/project/template'
  });
};

export default getTemplate;
