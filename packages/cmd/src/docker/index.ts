import path from 'path';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';
import simpleGit, { SimpleGit } from 'simple-git';
import semver from 'semver';

import { spawnAsync } from '@fujia/spawn';
import { NewEnvVariables, enhanceLog as log } from '@fujia/stage-share';
import { CliCommand, PackageModel } from '@fujia/stage-models';

import {
  inquireServerInfo,
  inquireSelectServerIp,
  inquireContainerMirrorServiceInfo,
  inquireSelectMirrorName,
  inquireUpgradeMirrorVersion,
  inquireServiceName,
  inquireSelectServiceName,
} from './inquirer-prompt';
import {
  DatabaseType,
  DeployType,
  ServerInfo,
  ServerInfoJson,
  ContainerMirrorServiceInfo,
  MirrorInfoJson,
} from './interface';
import {
  CLI_SERVICE_PATH,
  SERVER_INFO_FILE,
  SERVER_LIST_FILE,
  C_M_S_INFO_FILE,
  DOCKER_FILE,
  DOCKER_IGNORE_FILE,
} from './constants';
import {
  genBuildImageCmd,
  genPushImageCmd,
  genPullImageToServerCmd,
  genUpdateServiceCmd,
  getCwdProjectPackageJson,
} from './helper';

export class ServiceCommand extends CliCommand {
  git: SimpleGit;
  branch: string;
  databaseType: DatabaseType;
  serverInfo?: ServerInfo;
  cmsInfo?: ContainerMirrorServiceInfo;
  deployType: DeployType;
  cliServiceDir?: string;
  templatePkg?: PackageModel;
  upgradeMirrorVersion?: string;
  buildOpt?: boolean;
  serviceName?: string | boolean;
  constructor(args: any[]) {
    super(args);
    this.git = simpleGit();
    this.branch = 'main';
    this.databaseType = 'mongodb';
    this.deployType = 'local+docker';
    this.serverInfo = undefined;
  }

  async init() {
    this.buildOpt = this.cmd?.build;
    this.serviceName = this.cmd?.updateService;
    log.verbose(
      '[cli-docker]',
      `
        buildOpt: ${this.buildOpt}
        serviceName: ${this.serviceName}, ${typeof this.serviceName}
      `,
    );

    if (!this.buildOpt && !this.serviceName) {
      await spawnAsync('stage', ['help', 'docker'], {
        stdio: 'inherit',
        shell: true,
      });
    }

    if (this.buildOpt || this.serviceName) {
      await this.prepare();
      await this.getRemoteServerInfo();
      await this.getContainerMirrorServiceInfo();
    }

    if (this.buildOpt) {
      await this.upgradeVersion();
      await this.buildDockerImage();
      await this.pushImageToCloudMirrorRepo();
      await this.pullImageToServer();
    }
  }

  async exec() {
    try {
      if (this.serviceName) {
        await this.updateServiceByImage();
      }
    } catch (err: any) {
      log.error('', `${err?.message}`);
      throw err;
    }
  }

  async prepare() {
    this.checkDockerEnv();
    await this.checkCliServicePath();
    await this.checkMainBranch();
    await this.checkNotCommitted();
    await this.checkStash();
  }

  async buildDockerImage() {
    const { repoZone, repoNamespace, mirrorName } = this.cmsInfo! || {};
    const cmdCode = genBuildImageCmd({
      mirrorName,
      repoZone,
      repoNamespace,
      mirrorVersion: this.upgradeMirrorVersion,
    });

    const execCode = await spawnAsync(cmdCode, [], {
      stdio: 'inherit',
      shell: true,
    });

    log.verbose(
      '[cli-docker]',
      `exec the build docker image command and the exec code ${execCode}`,
    );

    if (execCode === 0) {
      log.success(
        '',
        `docker build the image ${mirrorName}:${this.upgradeMirrorVersion} successfully`,
      );
      await this.pushMainWithUpgradeVersion();
    } else {
      process.exit(execCode as number);
    }
  }

  async pushImageToCloudMirrorRepo() {
    const { repoZone, repoNamespace, mirrorName, owner, userPwd } =
      this.cmsInfo! || {};
    const cmdCode = genPushImageCmd({
      owner,
      userPwd,
      mirrorName,
      repoZone,
      repoNamespace,
      mirrorVersion: this.upgradeMirrorVersion,
    });

    const execCode = await spawnAsync(cmdCode, [], {
      stdio: 'inherit',
      shell: true,
    });

    log.verbose(
      '[cli-docker]',
      `exec the command of push image to free mirror repository and the exec code ${execCode}`,
    );

    if (execCode === 0) {
      log.success(
        '',
        `push the image ${mirrorName}:${this.upgradeMirrorVersion} to ${repoZone} successfully`,
      );
    } else {
      process.exit(execCode as number);
    }
  }

  async pullImageToServer() {
    const { repoZone, repoNamespace, mirrorName, owner, userPwd } =
      this.cmsInfo! || {};
    const { sshPort, userName, serverIP } = this.serverInfo!;
    const cmdCode = genPullImageToServerCmd({
      sshPort,
      userName,
      serverIP,
      owner,
      userPwd,
      mirrorName,
      repoZone,
      repoNamespace,
      mirrorVersion: this.upgradeMirrorVersion,
    });

    const execCode = await spawnAsync(cmdCode, [], {
      stdio: 'inherit',
      shell: true,
    });

    log.verbose(
      '[cli-docker]',
      `exec the command of pull image to the server(ip: ${serverIP}) and the exec code ${execCode}`,
    );

    if (execCode === 0) {
      log.success(
        '',
        `pull the image ${mirrorName}:${this.upgradeMirrorVersion} to ${serverIP} successfully`,
      );
    } else {
      process.exit(execCode as number);
    }
  }

  async updateServiceByImage() {
    const { repoZone, repoNamespace, mirrorName } = this.cmsInfo! || {};
    const { sshPort, userName, serverIP } = this.serverInfo!;

    if (this.serviceName === true) {
      await this.getServiceName();
    }

    if (typeof this.serviceName === 'string') {
      const cmdCode = genUpdateServiceCmd({
        sshPort,
        userName,
        serverIP,
        mirrorName,
        repoZone,
        repoNamespace,
        mirrorVersion: this.upgradeMirrorVersion,
        serviceName: this.serviceName,
      });

      const execCode = await spawnAsync(cmdCode, [], {
        stdio: 'inherit',
        shell: true,
      });

      log.verbose(
        '[cli-docker]',
        `exec the command of update the ${this.serviceName} service and the exec code ${execCode}`,
      );

      if (execCode === 0) {
        log.success('', `update the ${this.serviceName} service successfully`);
      }
    }
  }

  async getRemoteServerInfo() {
    const stageHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
    const localServerInfoFile = path.resolve(stageHome, SERVER_INFO_FILE);

    if (!pathExistSync(localServerInfoFile)) {
      this.serverInfo = await inquireServerInfo();

      const { serverIP } = this.serverInfo;
      const infoObj = {
        ipList: [serverIP],
        serverList: [this.serverInfo],
      };

      await fse.writeJSON(localServerInfoFile, infoObj);

      log.success(
        '',
        `write the server information to ${localServerInfoFile} successfully`,
      );
      return;
    }

    const readInfo: ServerInfoJson = await fse.readJson(localServerInfoFile);
    const { ipList, serverList } = readInfo;

    const selectIp = await inquireSelectServerIp(ipList);

    if (selectIp === 're-input') {
      this.serverInfo = await inquireServerInfo();

      const { serverIP } = this.serverInfo;
      const infoObj = {
        ipList: [serverIP, ...ipList],
        serverList: [this.serverInfo, ...serverList],
      };

      await fse.writeJSON(localServerInfoFile, infoObj);

      log.success(
        '',
        `add the server information to ${localServerInfoFile} successfully`,
      );
    } else {
      this.serverInfo = serverList.find((s) => s.serverIP === selectIp);
    }
  }

  async getContainerMirrorServiceInfo() {
    const stageHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
    const localCMSInfoFile = path.resolve(stageHome, C_M_S_INFO_FILE);

    if (!pathExistSync(localCMSInfoFile)) {
      this.cmsInfo = await inquireContainerMirrorServiceInfo();

      const { mirrorName } = this.cmsInfo;
      const mirrorObj: MirrorInfoJson = {
        nameList: [mirrorName],
        mirrorInfoList: [this.cmsInfo],
      };

      await fse.writeJSON(localCMSInfoFile, mirrorObj);

      log.success(
        '',
        `write container mirror service information to ${localCMSInfoFile} successfully`,
      );

      return;
    }

    const mirrorServiceInfo: MirrorInfoJson =
      await fse.readJson(localCMSInfoFile);
    const { nameList, mirrorInfoList } = mirrorServiceInfo;

    const selectName = await inquireSelectMirrorName(nameList);

    if (selectName === 're-input') {
      this.cmsInfo = await inquireContainerMirrorServiceInfo();

      const { mirrorName } = this.cmsInfo;
      const newMirrorObj = {
        nameList: [mirrorName, ...nameList],
        mirrorInfoList: [this.cmsInfo, ...mirrorInfoList],
      };

      await fse.writeJSON(localCMSInfoFile, newMirrorObj);

      log.success(
        '',
        `add the server information to ${localCMSInfoFile} successfully`,
      );
    } else {
      this.cmsInfo = mirrorInfoList.find((s) => s.mirrorName === selectName);
    }
  }

  async getServiceName() {
    const localServiceListFile = path.resolve(
      this.cliServiceDir!,
      SERVER_LIST_FILE,
    );

    if (!pathExistSync(localServiceListFile)) {
      this.serviceName = await inquireServiceName();

      const serviceObj = {
        nameList: [this.serviceName],
      };

      await fse.writeJSON(localServiceListFile, serviceObj);

      log.success(
        '',
        `write container mirror service information to ${localServiceListFile} successfully`,
      );

      return;
    }

    const serviceList = await fse.readJson(localServiceListFile);
    const { nameList } = serviceList;

    const selectName = await inquireSelectServiceName(nameList);

    this.serviceName = selectName;

    if (selectName === 're-input') {
      this.serviceName = await inquireServiceName();

      const newServiceObj = {
        nameList: [this.serviceName, ...nameList],
      };

      await fse.writeJSON(localServiceListFile, newServiceObj);

      log.success(
        '',
        `adds the service name to ${localServiceListFile} successfully`,
      );
    }
  }

  checkDockerEnv() {
    log.info(
      '',
      'please make sure the docker environment is configured and running on the local host and the remote server',
    );
    const cwdPath = process.cwd();
    const dockerFilePath = path.resolve(cwdPath, DOCKER_FILE);
    const dockerIgnoreFilePath = path.resolve(cwdPath, DOCKER_IGNORE_FILE);

    if (
      !pathExistSync(dockerFilePath) ||
      !pathExistSync(dockerIgnoreFilePath)
    ) {
      throw new Error(
        `there are not a ${DOCKER_FILE} or ${DOCKER_IGNORE_FILE} file in the project root directory`,
      );
    }
  }

  async upgradeVersion() {
    this.upgradeMirrorVersion = (await inquireUpgradeMirrorVersion()) as string;

    log.verbose(
      '[cli-docker]',
      `upgrade version to ${this.upgradeMirrorVersion} before building docker image`,
    );

    /**
     * NOTE: It's not certain that the project is an npm project.
     */
    if (getCwdProjectPackageJson() && semver.valid(this.upgradeMirrorVersion)) {
      await spawnAsync('npm', ['version', this.upgradeMirrorVersion], {
        stdio: 'inherit',
        shell: true,
      });
    }
  }

  async pushMainWithUpgradeVersion() {
    await this.git.push('origin', this.branch);
    log.success(
      '',
      `upgraded version successfully and push to ${this.branch} branch`,
    );
  }

  async gitRestUpgradeVersion() {
    await this.git.reset(['--hard', '--', 'package.json']);
  }

  async checkCliServicePath() {
    const stageHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
    const cliServiceDir = path.resolve(stageHome, CLI_SERVICE_PATH);

    if (pathExistSync(cliServiceDir)) {
      log.info('', `the local deploy directory is existed: ${cliServiceDir}`);
    } else {
      fse.mkdirSync(cliServiceDir);
      log.success(
        '',
        `creates the local deploy directory(${cliServiceDir}) successfully`,
      );
    }

    this.cliServiceDir = cliServiceDir;

    if (!pathExistSync(cliServiceDir)) {
      throw new Error(
        `the local deploy directory is not existed: ${cliServiceDir}`,
      );
    }
  }

  async checkMainBranch() {
    const isRepo = await this.git.checkIsRepo();

    if (!isRepo) {
      throw new Error(
        'the current working directory is invalid git repository',
      );
    }

    const branch = await this.git.branch();
    if (!['main', 'master'].includes(branch.current)) {
      throw new Error(
        `the current git branch is not main or master, please run the command: 'git checkout main', then try again!`,
      );
    }
    this.branch = branch.current;
    log.success('', `current git branch: ${branch.current}`);
  }

  async checkNotCommitted() {
    const status = await this.git.status();
    const { not_added, created, deleted, modified, renamed } = status;
    const isNotEmptyStatus =
      not_added.length > 0 ||
      created.length > 0 ||
      deleted.length > 0 ||
      modified.length > 0 ||
      renamed.length > 0;

    if (isNotEmptyStatus) {
      throw new Error('the git status is not empty, please handle manually!');
    }

    log.success('', 'the git status is empty');
  }

  async checkStash() {
    log.info('', 'check stash records');

    const stashList = await this.git.stashList();

    if (stashList.all.length > 0) {
      await this.git.stash(['pop']);
      log.success('', 'stash pop successfully');
    }

    // TODO: the step if need?
    // await this.git.push('origin', this.branch);
    // log.success('', 'execute push operations successfully before publish');
  }
}

function serviceCmd(args: any[]) {
  return new ServiceCommand(args);
}

export default serviceCmd;
