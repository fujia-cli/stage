import GitServer from './git-server';
import GiteeRequest from './gitee-request';

export default class Gitee extends GitServer {
  request: GiteeRequest | null;
  constructor() {
    super('gitee');
    this.request = null;
  }

  setToken(token: string): void {
    super.setToken(token);

    this.request = new GiteeRequest(token);
  }

  getUser() {
    return this.request?.get('/user');
  }

  getOrg(username: string) {
    return this.request?.get(`/users/${username}/orgs`, {
      page: 1,
      per_page: 100
    })
  }

  getRepo(loginName: string, projectName: string) {
    return this.request
      ?.get(`/repos/${loginName}/${projectName}`)
      .then(res => {
        return this.handleResponse(res);
      });
  }

  createRepo(projectName: string) {
    return this.request?.post('/user/repos', {
      name: projectName,
    });
  }

  createOrgRepo(loginName: string, projectName: string) {
    return this.request?.post(`/orgs/${loginName}/repos`, {
      name: projectName
    });
  }

  getTokenUrl() {
    return 'https://gitee.com/personal_access_tokens';
  }

  getTokenHelpUrl() {
    return 'https://gitee.com/help/articles/4191';
  }

  getRemote(loginName: string, projectName: string) {
    return `git@gitee.com:${loginName}/${projectName}.git`
  }
}
