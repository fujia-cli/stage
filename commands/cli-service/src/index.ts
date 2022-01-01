import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import CliPackage from '@fujia/cli-package';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';
import simpleGit, { SimpleGit } from 'simple-git';
import semver from 'semver';
import { NewEnvVariables, spawnAsync, readFile, spinnerInstance } from '@fujia/cli-utils';

import {
	inquireServerInfo,
	inquireSelectServerIp,
	inquireDeployType,
	inquireContainerMirrorServiceInfo,
	inquireSelectMirrorName,
	inquireServiceName,
	inquireSelectServiceName,
	inquireStackName,
	inquireSelectStackName,
} from './inquirer-prompt';
import {
	ServerInfo,
	ServerInfoJson,
	ContainerMirrorServiceInfo,
	MirrorInfoJson,
	ServiceType,
	DeployViaPM2CmdOptions,
	DeployServiceCmdOptions,
} from './interface';
import {
	CLI_SERVICE_PATH,
	SERVER_LIST_FILE,
	DOCKER_STACK_FILE,
	SERVER_INFO_FILE,
	C_M_S_INFO_FILE,
	STACK_LIST_FILE,
} from './constants';
import {
	genUpdateServiceCmd,
	genDeployServiceViaPM2Cmd,
	genDeployServiceCmd,
	genCheckServerWorkDirCmd,
} from './helper';

export class ServiceCommand extends CliCommand {
	serviceType?: ServiceType;
	stackName?: string;
	workDir?: string;
	serviceName?: string;
	cliServiceDir?: string;
	serverInfo?: ServerInfo;
	cmsInfo?: ContainerMirrorServiceInfo;
	subCmd?: string;
	deployType?: 'local+docker' | 'pm2';
	constructor(args: any[]) {
		super(args);
	}

	async init() {
		this.subCmd = this.cmd?.cmdName;

		if (this.subCmd === 'deploy') {
			this.stackName = this.argv[0];
			this.workDir = this.argv[1];
		} else if (this.subCmd === 'update') {
			this.serviceName = this.argv[0];
		}

		log.verbose(
			'[cli-service]',
			`
        subCmd: ${this.subCmd}
        stackName: ${this.stackName}
        workDir: ${this.workDir}
        serviceName: ${this.serviceName}
      `,
		);

		this.checkCliServicePath();
		if (this.subCmd === 'deploy') {
			this.deployType = (await inquireDeployType()).deployType;

			if (this.deployType === 'local+docker') {
				this.checkStackFile();
			}
		}

		await this.getRemoteServerInfo();

		if (this.deployType === 'local+docker' || this.subCmd === 'update') {
			await this.getContainerMirrorServiceInfo();
		}
	}

	async exec() {
		try {
			switch (this.subCmd) {
				case 'deploy':
					await this.prepareDeployService();
					break;
				case 'update':
					await this.updateServiceByImage();
				default:
					break;
			}
		} catch (err: any) {
			log.error('', `err?.message`);
			throw err;
		}
	}

	async prepareDeployService() {
		if (this.deployType === 'local+docker') {
			await this.deployStackViaDocker();
		} else if (this.deployType === 'pm2') {
			await this.deployServiceViaPM2();
		}
	}

	async deployStackViaDocker() {
		const { sshPort, userName, serverIP } = this.serverInfo!;

		if (!this.stackName) {
			await this.getStackName();
		}

		const cmdOptions: DeployServiceCmdOptions = {
			sshPort,
			userName,
			serverIP,
			stackName: this.stackName!,
		};

		if (this.workDir) {
			cmdOptions.appDir = this.workDir;
		}

		if (!!this.stackName) {
			const checkDirCmd = genCheckServerWorkDirCmd(cmdOptions);
			const cmdCode = genDeployServiceCmd(cmdOptions);

			const execCheckCode = await spawnAsync(checkDirCmd, [], {
				stdio: 'inherit',
				shell: true,
			});

			const execCode = await spawnAsync(cmdCode, [], {
				stdio: 'inherit',
				shell: true,
			});

			log.verbose(
				'[cli-docker]',
				`exec the command of deploy the ${this.stackName} service and the exec code ${execCode}`,
			);

			if (execCode === 0 && execCheckCode === 0) {
				log.success('', `deploy the ${this.stackName} service to ${serverIP} successfully`);
			}
		}
	}

	async deployServiceViaPM2() {
		const { sshPort, userName, serverIP } = this.serverInfo!;

		const cmdOptions: DeployViaPM2CmdOptions = {
			sshPort,
			userName,
			serverIP,
		};

		if (this.workDir) {
			cmdOptions.appDir = this.workDir;
		}

		const cmdCode = genDeployServiceViaPM2Cmd(cmdOptions);

		const execCode = await spawnAsync(cmdCode, [], {
			stdio: 'inherit',
			shell: true,
		});

		log.verbose(
			'[cli-docker]',
			`exec the command of deploy the ${this.serviceName} service via PM2 and the exec code ${execCode}`,
		);

		if (execCode === 0) {
			log.success(
				'',
				`using PM2 to deploy the ${this.serviceName} service on ${serverIP} successfully`,
			);
		}
	}

	async updateServiceByImage() {
		const { repoZone, repoNamespace, mirrorName } = this.cmsInfo! || {};
		const { sshPort, userName, serverIP } = this.serverInfo!;

		if (!this.serviceName) {
			await this.getServiceName();
		}

		if (!!this.serviceName) {
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
				'[cli-docker]',
				`exec the command of update the ${this.serviceName} service and the exec code ${execCode}`,
			);

			if (execCode === 0) {
				log.success('', `update the ${this.serviceName} service successfully`);
			}
		}
	}

	checkStackFile() {
		log.info('', 'check if have the stack.yml file in current directory.');
		const cwdPath = process.cwd();
		const stackFilePath = path.resolve(cwdPath, DOCKER_STACK_FILE);

		if (!pathExistSync(stackFilePath)) {
			throw new Error(`there are not a ${stackFilePath} file in the project root directory`);
		}
	}

	checkCliServicePath() {
		const stageHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
		const cliServiceDir = path.resolve(stageHome, CLI_SERVICE_PATH);

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

	async getStackName() {
		const localStackListFile = path.resolve(this.cliServiceDir!, STACK_LIST_FILE);

		if (!pathExistSync(localStackListFile)) {
			this.stackName = (await inquireStackName()).stackName;

			const stackObj = {
				nameList: [this.stackName],
			};

			await fse.writeJSON(localStackListFile, stackObj);

			log.success(
				'',
				`write container mirror stack information to ${localStackListFile} successfully`,
			);

			return;
		}

		const stackList = await fse.readJson(localStackListFile);
		const { nameList } = stackList;

		const selectName = (await inquireSelectStackName(nameList)).stackName;

		this.stackName = selectName;

		if (selectName === 're-input') {
			this.stackName = (await inquireStackName()).stackName;

			const newStackObj = {
				nameList: [this.stackName, ...nameList],
			};

			await fse.writeJSON(localStackListFile, newStackObj);

			log.success('', `adds the stack name to ${localStackListFile} successfully`);
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

		this.serviceName = selectName;

		if (selectName === 're-input') {
			this.serviceName = (await inquireServiceName()).serviceName;

			const newServiceObj = {
				nameList: [this.serviceName, ...nameList],
			};

			await fse.writeJSON(localServiceListFile, newServiceObj);

			log.success('', `adds the service name to ${localServiceListFile} successfully`);
		}
	}
}

function serviceCmd(args: any[]) {
	return new ServiceCommand(args);
}

export default serviceCmd;
