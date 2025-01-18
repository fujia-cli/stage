import { enhanceLog as log } from '@fujia/stage-share';

import GitServer from './git-server';
import GithubRequest from './github-request';

import { GithubUserInfo } from './interface';

export default class Github extends GitServer {
  request?: GithubRequest;
  constructor() {
    super('github');
  }

  setToken(token: string): void {
    super.setToken(token);

    this.request = new GithubRequest(token);
  }

  getUser() {
    return this.request?.get<GithubUserInfo>('/user');
  }

  getOrg() {
    return this.request?.get(`/user/orgs`, {
      page: 1,
      per_page: 100,
    });
  }

  getRepo(loginName: string, projectName: string) {
    return this.request
      ?.get(`/repos/${loginName}/${projectName}`)
      .then((res) => {
        return this.handleResponse(res);
      });
  }

  createRepo(projectName: string) {
    return this.request?.post(
      '/user/repos',
      {
        name: projectName,
      },
      {
        Accept: 'application/vnd.github.v3+json',
      },
    );
  }

  createOrgRepo(loginName: string, projectName: string) {
    log.verbose(
      '[cli-git]',
      `createOrgRepo:
      loginName: ${loginName}
      projectName: ${projectName}
    `,
    );
    return this.request?.post(
      `/orgs/${loginName}/repos`,
      {
        name: projectName,
      },
      {
        Accept: 'application/vnd.github.v3+json',
      },
    );
  }

  getTokenUrl() {
    return 'https://github.com/settings/tokens';
  }

  getTokenHelpUrl() {
    return 'https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh';
  }

  getRemote(loginName: string, projectName: string) {
    return `git@github.com:${loginName}/${projectName}.git`;
  }
}
