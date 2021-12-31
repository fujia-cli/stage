import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import CliPackage from '@fujia/cli-package';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';
import simpleGit, { SimpleGit } from 'simple-git';
import semver from 'semver';
import ejs from 'ejs';
import glob from 'glob';
import {
	NewEnvVariables,
	writeSimpleObjToDotFile,
	readDotFileToObj,
	spawnAsync,
	readFile,
	spinnerInstance,
	sleep,
} from '@fujia/cli-utils';

import {
	inquireAppCategory,
	inquireServerInfo,
	inquireSelectServerIp,
	inquireDatabaseType,
	inquireDeployType,
	inquireContainerMirrorServiceInfo,
	inquireSelectMirrorName,
	inquireUpgradeMirrorVersion,
	inquireServiceName,
	inquireSelectServiceName,
} from './inquirer-prompt';
import {
	DatabaseType,
	DeployType,
	AppCategory,
	ServerInfo,
	ServerInfoJson,
	ContainerMirrorServiceInfo,
	MirrorInfoJson,
	UpgradeVersionType,
	ServiceType,
} from './interface';
import {
	WEB,
	DATABASE,
	DOCKER_NGINX,
	LOCAL_DOCKER,
	GITLAB_DOCKER,
	PM2,
	MONGODB,
	MYSQL,
	CLI_SERVICE_PATH,
	SERVER_INFO_FILE,
	SERVER_LIST_FILE,
	C_M_S_INFO_FILE,
	DOCKER_FILE,
	DOCKER_IGNORE_FILE,
	SERVICE_UPDATE,
	SERVICE_DEPLOY,
	// GITLAB_CI_YAML,
	EJS_IGNORE_FILES,
	STAGE_CLI_TEMPLATES_DIR,
} from './constants';
import {
	genBuildImageCmd,
	genPushImageCmd,
	genPullImageToServerCmd,
	genUpdateServiceCmd,
	genDeployServiceViaPM2Cmd,
} from './helper';

export class ServiceCommand extends CliCommand {
	git: SimpleGit;
	branch: string;
	databaseType: DatabaseType;
	serverInfo?: ServerInfo;
	cmsInfo?: ContainerMirrorServiceInfo;
	deployType: DeployType;
	cliServiceDir?: string;
	templatePkg?: CliPackage;
	upgradeMirrorVersion?: string;
	serviceType?: ServiceType;
	serviceName?: string;
	constructor(args: any[]) {
		super(args);
		this.git = simpleGit();
		this.branch = 'main';
		this.databaseType = 'mongodb';
		this.deployType = 'local+docker';
		this.serverInfo = undefined;
	}

	async init() {
		this.serviceType = this.argv[0];
		this.serviceName = this.argv[1];

		log.verbose(
			'[cli-service]',
			`
        serviceType: ${this.serviceType}
        serviceName: ${this.serviceName}
      `,
		);

		await this.prepare();
		await this.getRemoteServerInfo();
		this.deployType = (await inquireDeployType()).deployType;

		if (this.deployType === 'local+docker') {
			this.checkDockerEnv();
			await this.getContainerMirrorServiceInfo();
			await this.upgradeVersion();
			await this.buildDockerImage();
			await this.pushImageToCloudMirrorRepo();
			await this.pullImageToServer();
		}
	}

	async exec() {
		try {
			if (this.deployType === 'pm2') {
			} else if (this.deployType === 'local+docker' && this.serviceType === 'update') {
				this.updateServiceByImage();
			}
		} catch (err: any) {
			log.error('', `err?.message`);
			throw err;
		}
	}

	async prepare() {
		await this.checkCliServicePath();
		await this.checkMainBranch();
		await this.checkNotCommitted();
		await this.checkStash();
	}

	async buildDockerImage() {
		const { repoZone, repoNamespace, mirrorName } = this.cmsInfo!;
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
			'[cli-service]',
			`exec the build docker image command and the exec code ${execCode}`,
		);

		if (execCode === 0) {
			log.success(
				'',
				`docker build the image ${mirrorName}:${this.upgradeMirrorVersion} successfully`,
			);
		}
	}

	async pushImageToCloudMirrorRepo() {
		const { repoZone, repoNamespace, mirrorName, owner, userPwd } = this.cmsInfo!;
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
			'[cli-service]',
			`exec the command of push image to free mirror repository and the exec code ${execCode}`,
		);

		if (execCode === 0) {
			log.success(
				'',
				`push the image ${mirrorName}:${this.upgradeMirrorVersion} to ${repoZone} successfully`,
			);
		}
	}

	async pullImageToServer() {
		const { repoZone, repoNamespace, mirrorName, owner, userPwd } = this.cmsInfo!;
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
			'[cli-service]',
			`exec the command of pull image to the server(ip: ${serverIP}) and the exec code ${execCode}`,
		);

		if (execCode === 0) {
			log.success(
				'',
				`pull the image ${mirrorName}:${this.upgradeMirrorVersion} to ${serverIP} successfully`,
			);
		}
	}

	async deployServiceByImage() {}

	async updateServiceByImage() {
		const { repoZone, repoNamespace, mirrorName } = this.cmsInfo!;
		const { sshPort, userName, serverIP } = this.serverInfo!;

		if (!this.serviceName) {
			await this.getServiceName();
		}

		if (!this.serviceName) throw new Error('the service name is not exist');

		const cmdCode = genUpdateServiceCmd({
			sshPort,
			userName,
			serverIP,
			mirrorName,
			repoZone,
			repoNamespace,
			serviceName: this.serviceName,
		});

		const execCode = await spawnAsync(cmdCode, [], {
			stdio: 'inherit',
			shell: true,
		});

		log.verbose(
			'[cli-service]',
			`exec the command of update the ${this.serviceName} service and the exec code ${execCode}`,
		);

		if (execCode === 0) {
			log.success('', `update the ${this.serviceName} service successfully`);
		}
	}

	async getRemoteServerInfo() {
		const localServerInfoFile = path.resolve(this.cliServiceDir!, SERVER_INFO_FILE);

		if (!pathExistSync(localServerInfoFile)) {
			this.serverInfo = await inquireServerInfo();

			const { serverIP } = this.serverInfo;
			const infoObj = {
				ipList: [serverIP],
				serverList: [this.serverInfo],
			};

			await fse.writeJSON(localServerInfoFile, infoObj);

			log.success('', `write the server information to ${localServerInfoFile} successfully`);
			return;
		}

		const readInfo: ServerInfoJson = await fse.readJson(localServerInfoFile);
		const { ipList, serverList } = readInfo;

		const selectIp = (await inquireSelectServerIp(ipList)).serverIp;

		if (selectIp === 're-input') {
			this.serverInfo = await inquireServerInfo();

			const { serverIP } = this.serverInfo;
			const infoObj = {
				ipList: [serverIP, ...ipList],
				serverList: [this.serverInfo, ...serverList],
			};

			await fse.writeJSON(localServerInfoFile, infoObj);

			log.success('', `add the server information to ${localServerInfoFile} successfully`);
		} else {
			this.serverInfo = serverList.find((s) => s.serverIP === selectIp);
		}
	}

	async getContainerMirrorServiceInfo() {
		const localCMSInfoFile = path.resolve(this.cliServiceDir!, C_M_S_INFO_FILE);

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

		const mirrorServiceInfo: MirrorInfoJson = await fse.readJson(localCMSInfoFile);
		const { nameList, mirrorInfoList } = mirrorServiceInfo;

		const selectName = (await inquireSelectMirrorName(nameList)).mirrorName;

		if (selectName === 're-input') {
			this.cmsInfo = await inquireContainerMirrorServiceInfo();

			const { mirrorName } = this.cmsInfo;
			const newMirrorObj = {
				nameList: [mirrorName, ...nameList],
				mirrorInfoList: [this.cmsInfo, ...mirrorInfoList],
			};

			await fse.writeJSON(localCMSInfoFile, newMirrorObj);

			log.success('', `add the server information to ${localCMSInfoFile} successfully`);
		} else {
			this.cmsInfo = mirrorInfoList.find((s) => s.mirrorName === selectName);
		}
	}

	async getServiceName() {
		const localServiceListFile = path.resolve(this.cliServiceDir!, SERVER_LIST_FILE);

		if (!pathExistSync(localServiceListFile)) {
			this.serviceName = (await inquireServiceName()).serviceName;

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

		const selectName = (await inquireSelectServiceName(nameList)).serviceName;

		if (selectName === 're-input') {
			this.serviceName = (await inquireServiceName()).serviceName;

			const newServiceObj = {
				nameList: [this.serviceName, ...nameList],
			};

			await fse.writeJSON(localServiceListFile, newServiceObj);

			log.success('', `adds the service name to ${localServiceListFile} successfully`);
		}
	}

	checkDockerEnv() {
		log.info(
			'',
			'please make sure the docker environment is configured on the local host and the remote server',
		);
		const cwdPath = process.cwd();
		const dockerFilePath = path.resolve(cwdPath, DOCKER_FILE);
		const dockerIgnoreFilePath = path.resolve(cwdPath, DOCKER_IGNORE_FILE);

		if (!pathExistSync(dockerFilePath) || !pathExistSync(dockerIgnoreFilePath)) {
			throw new Error(
				`there are not a ${DOCKER_FILE} or ${DOCKER_IGNORE_FILE} file in the project root directory`,
			);
		}
	}

	async upgradeVersion() {
		this.upgradeMirrorVersion = (await inquireUpgradeMirrorVersion()).mirrorVersion;
		log.verbose(
			'[cli-service]',
			`upgrade version to ${this.upgradeMirrorVersion} before building docker image`,
		);

		if (semver.valid(this.upgradeMirrorVersion)) {
			await spawnAsync('npm', ['version', this.upgradeMirrorVersion], {
				stdio: 'inherit',
				shell: true,
			});

			await this.git.push('origin', this.branch);
			log.success('', `upgraded version successfully and push to ${this.branch} branch`);
		}
	}

	async checkCliServicePath() {
		const userHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
		const cliServiceDir = path.resolve(userHome, CLI_SERVICE_PATH);

		if (pathExistSync(cliServiceDir)) {
			log.info('', `the local deploy directory is existed: ${cliServiceDir}`);
		} else {
			fse.mkdirSync(cliServiceDir);
			log.success('', `creates the local deploy directory(${cliServiceDir}) successfully`);
		}

		this.cliServiceDir = cliServiceDir;

		if (!pathExistSync(cliServiceDir)) {
			throw new Error(`the local deploy directory is not existed: ${cliServiceDir}`);
		}
	}

	async checkMainBranch() {
		const isRepo = await this.git.checkIsRepo();

		if (!isRepo) {
			throw new Error('the current working directory is invalid git repository');
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
