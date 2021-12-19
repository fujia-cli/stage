import { classMethodNotImplError } from './helper';

export default class GitServer {
  constructor(public type: string, public token?: string) {
    this.type = type
    this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  createRepo(projectName: string) {
    classMethodNotImplError('createRepo');
  }

  createOrgRepo(loginName: string, projectName: string) {
    classMethodNotImplError('createOrgRepo');
  }

  getRemote(loginName: string, projectName: string) {
    classMethodNotImplError('getRemote');
  }

  getUser() {
    classMethodNotImplError('getUser');
  }

  getOrg(username: string) {
    classMethodNotImplError('getOrg');
  }

  getRepo(loginName: string, projectName: string) {
    classMethodNotImplError('getRepo');
  }

  getTokenUrl() {
    classMethodNotImplError('getTokenUrl');
  }

  getTokenHelpUrl() {
      classMethodNotImplError('getTokenHelpUrl');
  }

  isHttpResponse = res => res && res.status;

  handleResponse(res) {
    if (this.isHttpResponse(res) && res.status !== 200) return null;

    return res;
  }
};
