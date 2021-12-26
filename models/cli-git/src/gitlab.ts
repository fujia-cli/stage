import GitServer from "./git-server";
import GitlabRequest from "./gitlab-request";
import { AxiosPromise } from "axios";

export default class Gitlab extends GitServer {
  request?: GitlabRequest;
  constructor() {
    super("gitlab");
  }

  setToken(token: string): void {
    super.setToken(token);

    this.request = new GitlabRequest(token);
  }

  getUser() {
    return this.request?.get("/user");
  }

  getOrg() {
    return this.request?.get(`/user/orgs`, {
      page: 1,
      per_page: 100,
    });
  }

  getRepo(loginName: string, projectName: string) {
    return this.request?.get(`/repos/${loginName}/${projectName}`).then((res) => {
      return this.handleResponse(res);
    });
  }

  createRepo(projectName: string) {
    return this.request?.post(
      "/user/repos",
      {
        name: projectName,
      },
      {
        Accept: "application/vnd.github.v3+json",
      }
    );
  }

  createOrgRepo(loginName: string, projectName: string) {
    return this.request?.post(
      `/orgs/${loginName}/repos`,
      {
        name: projectName,
      },
      {
        Accept: "application/vnd.github.v3+json",
      }
    );
  }

  getTokenUrl() {
    return "";
  }

  getTokenHelpUrl() {
    return "";
  }

  getRemote(loginName: string, projectName: string) {
    return `git@gitlab.com:${loginName}/${projectName}.git`;
  }
}
