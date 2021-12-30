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
} from './inquirer-prompt';
import {
	DatabaseType,
	DeployType,
	AppCategory,
	ServerInfo,
	ServerInfoJson,
	ContainerMirrorServiceInfo,
	MirrorInfoJson,
	DeployScriptTemplate,
	UpgradeVersionType,
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
	C_M_S_INFO_FILE,
	DOCKER_FILE,
	DOCKER_IGNORE_FILE,
	// GITLAB_CI_YAML,
	EJS_IGNORE_FILES,
	STAGE_CLI_TEMPLATES_DIR,
	DEPLOY_SCRIPTS_PKG_INFO,
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
	appCategory: AppCategory;
	databaseType: DatabaseType;
	serverInfo?: ServerInfo;
	cmsInfo?: ContainerMirrorServiceInfo;
	deployType: DeployType;
	cliServiceDir?: string;
	templateInfo?: DeployScriptTemplate;
	templatePkg?: CliPackage;
	constructor(args: any[]) {
		super(args);
		this.git = simpleGit();
		this.branch = 'main';
		this.appCategory = 'web';
		this.databaseType = 'mongodb';
		this.deployType = 'local+docker';
		this.serverInfo = undefined;
	}

	async init() {
		await this.prepare();

		this.appCategory = (await inquireAppCategory()).appCategory;

		await this.getRemoteServerInfo();

		if (this.appCategory === 'web') {
			this.deployType = (await inquireDeployType()).deployType;
			const isDockerEnv = [LOCAL_DOCKER, GITLAB_DOCKER].includes(this.deployType);

			if (isDockerEnv) {
				await this.checkDockerEnv();
			}
		} else if (this.appCategory === 'database') {
			await this.checkDockerEnv();

			this.databaseType = (await inquireDatabaseType()).databaseType;
		} else if (this.appCategory === 'docker-nginx') {
			await this.checkDockerEnv();
		}
	}

	async exec() {
		try {
			switch (this.appCategory) {
				case 'web':
					await this.startDeployWeb();
					break;
				case 'database':
					await this.startDeployDatabase();
					break;
				case 'docker-nginx':
					await this.startDeployNginx();
					break;
				default:
					throw new Error(`the ${this.appCategory} is not valid app category`);
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

	async startDeployWeb() {
		if (this.deployType === PM2) {
			await this.deployWebByPM2();
		} else if (this.deployType === LOCAL_DOCKER) {
			await this.deployWebByDocker();
		}
	}

	async startDeployDatabase() {}

	async startDeployNginx() {}

	async deployWebByPM2() {}

	async deployWebByDocker() {
		// const { userName, userPwd, repoName, repoZone, repoNamespace, mirrorName, mirrorVersion } =
		// 	this.cmsInfo!;
		// const { userName, sshPort, serverIP } = this.serverInfo!;
	}

	async buildDockerImage() {
		const { repoName, repoZone, repoNamespace, mirrorName, mirrorVersion } = this.cmsInfo!;
		const cmdCode = genBuildImageCmd({
			repoName,
			mirrorName,
			mirrorVersion,
			repoZone,
			repoNamespace,
		});

		await spawnAsync('sh', [cmdCode], {
			stdio: 'inherit',
			shell: true,
		});

		log.success('', `docker build the image ${mirrorName} successfully`);
	}

	async pushImageToCloudMirrorRepo() {}

	async pullImageToServer() {}

	async deployServiceByImage() {}

	async updateServiceByImage() {}

	// async deployWebByGitlabAndDocker() {}
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

	async upgradeVersion() {
		const { mirrorVersion } = this.cmsInfo!;

		log.verbose(
			'[cli-service]',
			`upgrade version to ${mirrorVersion} before building docker image`,
		);

		if (semver.valid(mirrorVersion)) {
			await spawnAsync('npm', ['version', mirrorVersion], {
				stdio: 'inherit',
			});

			await this.git.push('origin', this.branch);
			log.success('', `upgraded version successful and push to ${this.branch} branch`);
		}
	}

	async checkDockerEnv() {
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

		await this.getContainerMirrorServiceInfo();
		await this.upgradeVersion();
		await this.buildDockerImage();
		// await this.pushImageToCloudMirrorRepo();
		// await this.pullImageToServer();
	}

	async checkCliServicePath() {
		const userHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
		const cliServiceDir = path.resolve(userHome, CLI_SERVICE_PATH);

		if (pathExistSync(cliServiceDir)) {
			log.info('', `the local deploy directory is existed: ${cliServiceDir}`);
		} else {
			fse.mkdirSync(cliServiceDir);
			log.success('', `creates the local deploy directory(${cliServiceDir}) successful`);
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
			log.success('', 'stash pop successful');
		}

		// TODO: the step if need?
		// await this.git.push('origin', this.branch);
		// log.success('', 'execute push operations successful before publish');
	}
}

function serviceCmd(args: any[]) {
	return new ServiceCommand(args);
}

export default serviceCmd;
