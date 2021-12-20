import fs from 'fs';
import path from 'path';
import simpleGit, { SimpleGit, TaskOptions } from 'simple-git';
import fse from 'fs-extra';
import userHome from '@fujia/user-home';
import terminalLink from 'terminal-link';
import semver from 'semver';
import log from '@fujia/cli-log';
import { readFile, writeFile, spinnerInstance, NewEnvVariables, spreadObjToString } from '@fujia/cli-utils';
import { AxiosResponse, AxiosPromise } from 'axios';

import Github from './Github';
import Gitee from './Gitee';
import GitServer from './git-server';
import {
  inquireGitPlatform,
  inquireGitToken,
  inquireRepoOwner,
  inquireOrg,
  inquireCommitMessage,
  inquireUpgradeVersionType,
} from './inquire-prompt';
import {
  DEFAULT_CLI_HOME,
  GIT_ROOT_DIR,
  GIT_SERVER_FILE,
  GIT_TOKEN_FILE,
  GIT_OWN_FILE,
  GIT_LOGIN_FILE,
  GIT_IGNORE_FILE,
  IGNORE_FILE_CONTENT,
  REPO_OWNER_USER,
  REPO_OWNER_ORG,
  VERSION_RELEASE,
  VERSION_FEATURE,
  GIT_OWNER_TYPE,
  VERSION_MAP_REG
} from './constants';
import { GitPlatformType, BranchType } from './interface';
import Gitlab from './gitlab';

class GitCore {
  projectName: string;
  version: string;
  sourceDir: string;
  git: SimpleGit;
  gitServer: Github | Gitlab| Gitee | undefined;
  homePath: string;
  user: unknown;
  orgs: AxiosResponse | undefined;
  owner: string | undefined;
  loginName: string | undefined;
  repo: string | undefined;
  refreshRepo: boolean;
  refreshToken: boolean;
  refreshOwner: boolean;
  branch: string | undefined;
  remote: string;
  token: string;
  constructor({
    projectName,
    version,
    sourceDir
  }: {
    projectName: string,
    version: string,
    sourceDir: string
  }, {
    refreshRepo = false,
    refreshToken = false,
    refreshOwner = false,
  }) {
    this.projectName = projectName;                                     // project name
    this.version = version;                                             // version of project
    this.sourceDir = sourceDir;                                         // directory of source code
    this.git = simpleGit({                                              // instance of SimpleGit
      baseDir: this.sourceDir,
    });
    this.gitServer = undefined;                                         // instance of GitServer
    this.homePath = process.env[NewEnvVariables.STAGE_CLI_HOME] || '';  // directory of local caches
    this.user = undefined;                                              // user information
    this.orgs = undefined;                                              // the list of organizations that the user own
    this.owner = undefined;                                             // the type of remote repository
    this.loginName = undefined;                                         // the login name of remote repository
    this.repo = undefined;                                              // the information of remote repository
    this.refreshRepo = refreshRepo;                                     // force to update the remote Git repository
    this.refreshToken = refreshToken;                                   // force to update the token of remote repository
    this.refreshOwner = refreshOwner;                                   // force to update the type of remote repository
    this.branch = undefined;                                            // local develop branch
    this.remote = '';                                                   // the url of repository, such as: git@github.com:${loginName}/${projectName}.git
    this.token = '';
  }

  async prepare() {
    try {
      await this.checkHomePath();               // check the main cached directory
      await this.checkGitServer();              // check the type of user's remote repository
      await this.checkGitToken();               // check and obtain the token of remote repository
      await this.getUserAndOrgs();              // obtain the user of repository and organization information
      await this.checkGitOwner();               // confirm the type of remote repository
      await this.checkRepoAndCreate();          // check and create remote repository
      this.checkGitIgnore();                    // check and create the file of .gitignore
      await this.init();                        // initial local repository
    } catch (error: any) {
      log.error('[cli-git]', error?.message);
    }
  }

  async init() {
    if (this.getRemote()) return;

    await this.initAndAddRemote();               // execute "git remote add origin ...

    await this.initCommit();
  }

  async initAndAddRemote() {
    log.info('[cli-git]', 'execute git initializing...');
    await this.git.init();
    log.info('[cli-git]', 'execute "git remote add ..."');

    const remotes = await this.git.getRemotes();

    log.verbose('[cli-git]', `git remotes: ${remotes.join(', ')}`);

    if (!remotes.find(i => i.name === 'origin')) {
      await this.git.addRemote('origin', this.remote);
    }
  }

  async initCommit() {
    await this.checkConflicted();               // check if have code conflicts
    await this.checkNotCommitted();

    if (await this.checkRemoteMain()) {
      await this.pullRemoteRepo('main', {
        '--allow-unrelated-histories': null
      })
    } else {
      await this.pushRemoteRepo('main');
    }
  }

  async pullRemoteRepo(branchName: string, options?: TaskOptions) {
    log.info('[cli-git]', `synchronizing remote ${branchName} branch code`);

    await this.git.pull('origin', branchName, options)
      .catch((err: any) => {
        log.error('[cli-git]', err?.message);
      });
  }

  async pushRemoteRepo(branchName?: string) {
    log.info('[cli-git]', `push code to ${branchName} branch`);
    await this.git.push('origin', branchName);
    log.success('[cli-git]', 'push code successful');
  }

  async commit() {
    try {
      await this.getCorrectVersion();            // generate develop branch
      await this.checkStash();                   // check stash zone
      await this.checkConflicted();
      await this.checkoutBranch(this.branch);     // check out develop branch
      await this.pullRemoteMainToBranch();       // merge remote main branch and develop branch code
      await this.pushRemoteRepo(this.branch);     // push develop branch to remote repository
    } catch (err: any) {
      log.error('[cli-git]', `commit error: ${err?.message}`);
    }
  }

  async pullRemoteMainToBranch() {
    log.info('[cli-git]', `merge [main] branch to [${this.branch}] branch`);
    await this.pullRemoteRepo('main');
    log.success('[cli-git]', 'merge remote [main] branch code successful');

    await this.checkRemoteMain();
    log.info('[cli-git]', 'check remote develop branch');

    const remoteBranchList = await this.getRemoteBranchList('feature');

    if (remoteBranchList.includes(this.version)) {
      log.info('[cli-git]', 'merge remote develop branch to local develop branch');
      await this.pullRemoteRepo(this.branch!);

      log.success('[cli-git]', `merge remote [${this.branch}] branch code successful`);

      await this.checkConflicted();
    } else {
      log.info('[cli-git]', `the remote ${this.branch} branch is not exist`);
    }
  }

  async checkoutBranch(branch: string | undefined) {
    if (!branch) throw new Error(`the branch is not exist.`)
    const localBranchList = await this.git.branchLocal();

    if (localBranchList.all.includes(branch)) {
      await this.git.checkout(branch);
    } else {
      await this.git.checkoutLocalBranch(branch);
    }
  }

  async checkStash() {
    log.info('[cli-git]', 'check stash records');

    const stashList = await this.git.stashList();

    if (stashList.all.length > 0) {
      await this.git.stash(['pop']);
      log.success('[cli-git]', 'stash pop successful');
    }
  }

  async getCorrectVersion() {
    /**
    * NOTE: steps
    *
    * 1, fetch remote branches
    * 2, generate local develop branch
    * 3, synchronizing version to package.json
    */
    log.info('[cli-git]', 'fetch code branches');

    const remoteBranchList = await this.getRemoteBranchList(VERSION_RELEASE);

    let releaseVersion: string | undefined;
    if (remoteBranchList?.length > 0) {
      releaseVersion = remoteBranchList[0];
    }

    log.verbose('[cli-git]', `The latest remote version: ${releaseVersion}`);

    const featureVersion = this.version;
    if (!releaseVersion) {
      this.branch = `${VERSION_FEATURE}/${featureVersion}`;
    } else if(semver.gt(this.version, releaseVersion)) {
      log.info('[cli-git]', `current version greater than remote latest version:
        feature: ${featureVersion}
        release: ${releaseVersion}
      `);

      this.branch = `${VERSION_FEATURE}/${featureVersion}`;
    } else {
      log.info('[cli-git]', `current version less than remote latest version:
        feature: ${featureVersion}
        release: ${releaseVersion}
      `);

      const upgradeType = (await inquireUpgradeVersionType(releaseVersion)).upgradeType;

      const incVersion = semver.inc(releaseVersion, upgradeType);
      this.branch = `${VERSION_FEATURE}/${incVersion}`;
      this.version = incVersion!;

      log.verbose('[cli-git]', `the branch: ${this.branch}`);

      this.syncVersionToPackageJson();
    }
  }

  async getRemoteBranchList(type: BranchType) {
    const remoteList = await this.git.listRemote(['--refs']);
    const versionReg = VERSION_MAP_REG[type];

    return remoteList.split('\n')
      .map(remote => {
        const match = versionReg.exec(remote);

        versionReg.lastIndex = 0;

        if (match && semver.valid(match[1])) {
          return match[1];
        }
      })
      .filter(_ => _)
      .sort((a, b) => {
        if (semver.lte(b as string, a as string)) {
          if (a === b) return 0;

          return -1;
        }

        return 1;
      });
  }

  async checkRemoteMain() {
    const remoteList = await this.git.listRemote(['--refs']);

    return remoteList.indexOf('refs/heads/main') >= 0 || remoteList.indexOf('refs/heads/master') >= 0;
  }

  async checkNotCommitted() {
    const status = await this.git.status();
    const {
      not_added,
      created,
      deleted,
      modified,
      renamed,
    } = status;
    const isNotEmptyStatus = not_added.length > 0
      || created.length > 0
      || deleted.length > 0
      || modified.length > 0
      || renamed.length > 0;

    if (isNotEmptyStatus) {
      await this.git.add(status.not_added);
      await this.git.add(status.created);
      await this.git.add(status.deleted);
      await this.git.add(status.modified);
      await this.git.add(status.renamed.map(f => f.to));

      const message = (await inquireCommitMessage()).message;

      if (message) {
        await this.git.commit(message);
        log.success('[cli-git]', 'commit successful');
      }
    }
  }

  async checkConflicted() {
    log.info('[cli-git]', 'check whether have conflicts for code.')
    const status = await this.git.status();

    if (status.conflicted.length > 0) {
      throw new Error('There are conflicts in current code. please manually handle the merge and try again.')
    }

    log.success('[cli-git]', 'code conflict check passed.')
  }

  async checkRepoAndCreate() {
    const res = await this.gitServer?.getRepo(this.loginName!, this.projectName);
    let repo = res?.data;

    if (!repo) {
      const spinner = spinnerInstance('Starting to create remote repository...');
      try {
        if (this.owner === REPO_OWNER_USER) {
          const result = await this.gitServer?.createRepo(this.projectName);
          repo = result?.data;
        } else {
          this.gitServer?.createOrgRepo(this.loginName!, this.projectName);
        }
      } catch (err: any) {
        log.error('[cli-git]', err?.message);
      } finally {
        spinner.stop(true);
      }

      if (repo) {
        log.success('[cli-git]', 'created the remote repository successful.')
      } else {
        throw new Error('Oops! created the remote repository failed.')
      }
    } else {
      log.success('[cli-git]', 'get the information of remote repository successful.');
    }

    log.verbose('[cli-git]', `the repo: ${repo}`);
    this.repo = repo;
  }

  async checkGitServer() {
    const gitServerPath = this.createPath(GIT_SERVER_FILE);
    let gitServer = readFile(gitServerPath) as GitPlatformType;

    if (!gitServer || this.refreshRepo) {
      gitServer = (await inquireGitPlatform()).gitServer;
      writeFile(gitServerPath, gitServer);

      log.success('[cli-git]', `write git server success: ${gitServer} -> ${gitServerPath}`);
    } else {
      log.success('[cli-git]', `get gitServer success: ${GitServer}`);
    }

    this.gitServer = this.createGitServer(gitServer);

    if (!this.gitServer) {
      throw new Error('initial GitServer failed');
    }
  }

  async checkGitToken() {
    const tokenPath = this.createPath(GIT_TOKEN_FILE);
    let token = readFile(tokenPath) as string | null;

    if (!token || this.refreshToken) {
      const tokenUrl = terminalLink('Personal access tokens', this.gitServer?.getTokenUrl()!)
      log.warn('[cli-git]', `
        The token of ${this.gitServer?.type} have not generated, Please make sure that exist.
        seeing here: ${tokenUrl}
      `);
      console.log();

      token = (await inquireGitToken()).token;
      writeFile(tokenPath, token);
      log.success('[cli-git]', 'write token successful');
    } else {
      log.success('[cli-git]', `get token successful from ${tokenPath}`);
    }

    this.token = token;
    this.gitServer?.setToken(token);
  }

  async getUserAndOrgs() {
    const res = await this.gitServer?.getUser();

    this.user = res?.data;

    if (!this.user) {
      throw new Error('fetch user information failed.')
    }
    log.verbose('[cli-git]', spreadObjToString(this.user, 'user') || '');

    this.orgs = await this.gitServer?.getOrg((this.user as any).login);

    log.verbose('[cli-git]', `orgs: ${this.orgs}`);
    log.success('[cli-git]', `${this.gitServer?.type}: obtain user and organizations information successful.`);
  }

  async checkGitOwner() {
    const ownerPath = this.createPath(GIT_OWN_FILE);
    const loginPath = this.createPath(GIT_LOGIN_FILE);

    let owner = readFile(ownerPath) as string;
    let login = readFile(loginPath) as string;

    if (!owner || !login || this.refreshOwner) {
      owner = (await inquireRepoOwner(this.orgs)).owner;

      if (owner === REPO_OWNER_USER) {
        login = (this.user as any).login
      } else {
        login = (await inquireOrg(this.orgs)).login;

        writeFile(ownerPath, owner);
        writeFile(loginPath, login);
        log.success('[cli-git]', `write the ${owner} in ${ownerPath} successful.`);
        log.success('[cli-git]', `write the ${login} in ${loginPath} successful.`);
      }
    } else {
      log.success('[cli-git]', `read the ${owner} successful.`);
      log.success('[cli-git]', `read the ${login} successful.`);
    }

    this.owner = owner;
    this.loginName = login;
  }

  async checkHomePath() {
    if (!this.homePath) {
      const homeDir = await userHome();
      this.homePath = path.resolve(homeDir!, DEFAULT_CLI_HOME);
    }

    log.verbose('[cli-git]', `homePath: ${this.homePath}`);

    fse.ensureDirSync(this.homePath);
    if (!fs.existsSync(this.homePath)) {
      throw new Error('Oops! Gets user home directory failed.')
    }
  }

  syncVersionToPackageJson() {
    const pkg = fse.readJSONSync(`${this.sourceDir}/package.json`);

    if (pkg && pkg.version !== this.version) {
      pkg.version = this.version;
      fse.writeJsonSync(`${this.sourceDir}/package.json`, pkg, { spaces: 2 });
    }
  }

  getRemote() {
    const gitPath = path.resolve(this.sourceDir, GIT_ROOT_DIR);

    if (this.gitServer) {
      this.remote = this.gitServer.getRemote(this.loginName!, this.projectName);
    }

    if (fs.existsSync(gitPath)) {
      log.success('[cli-git]', 'Git finished initialization');
      return true;
    }
  }

  checkGitIgnore() {
    const gitIgnore = path.resolve(this.sourceDir, GIT_IGNORE_FILE);

    if (!fs.existsSync(gitIgnore)) {
      writeFile(gitIgnore, IGNORE_FILE_CONTENT);
      log.success('[cli-git]', `write the git ignore content in ${gitIgnore} successful.`);
    }
  }

  createGitServer(gitType: GitPlatformType) {
    if (gitType === 'Github') {
      return new Github();
    } else if (gitType === 'Gitee') {
      return new Gitee();
    } else if (gitType === 'Gitlab') {
      return new Gitlab();
    }
  }

  createPath(file: string) {
    const gitRootDir = path.resolve(this.homePath, GIT_ROOT_DIR);
    const filePath = path.resolve(gitRootDir, file);
    fse.ensureDirSync(gitRootDir);
    return filePath;
  }
}

export default GitCore;
