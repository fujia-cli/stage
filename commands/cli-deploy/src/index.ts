import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import CliPackage from '@fujia/cli-package';
import fse from 'fs-extra';
import { pathExistSync } from '@fujia/check-path';
import simpleGit, { SimpleGit } from 'simple-git';
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
	inquireDatabaseType,
	inquireDeployType,
	inquireContainerMirrorServiceInfo,
} from './inquirer-prompt';
import {
	DatabaseType,
	DeployType,
	AppCategory,
	ServerInfo,
	ContainerMirrorServiceInfo,
	DeployScriptTemplate,
} from './interface';
import {
	WEB,
	DATABASE,
	DOCKER_NGINX,
	APP,
	ELECTRON,
	LOCAL_DOCKER,
	GITLAB_DOCKER,
	PM2,
	MONGODB,
	MYSQL,
	LOCAL_DEPLOY_PATH,
	SERVER_INFO_FILE,
	C_M_S_INFO_FILE,
	DOCKER_FILE,
	DOCKER_IGNORE_FILE,
	GITLAB_CI_YAML,
	EJS_IGNORE_FILES,
	STAGE_CLI_TEMPLATES_DIR,
	DEPLOY_SCRIPTS_PKG_INFO,
} from './constants';

export class DeployCommand extends CliCommand {
	git: SimpleGit;
	branch: string;
	appCategory: AppCategory;
	databaseType: DatabaseType;
	serverInfo?: ServerInfo;
	cmsInfo?: ContainerMirrorServiceInfo;
	deployType: DeployType;
	localDeployDir?: string;
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

		if ([WEB, DATABASE, DOCKER_NGINX].includes(this.appCategory)) {
			await this.getRemoteServerInfo();
		}

		if (this.appCategory === 'web') {
			this.deployType = (await inquireDeployType()).deployType;
			const isDockerEnv = [LOCAL_DOCKER, GITLAB_DOCKER].includes(this.deployType);

			if (this.deployType === GITLAB_DOCKER) {
				this.checkGitlabCiYml();
			}

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
				case 'app':
					await this.startDeployApp();
					break;
				case 'electron':
					await this.startDeployElectron();
					break;
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
		await this.checkCliDeployPath();
		await this.checkMainBranch();
		await this.checkNotCommitted();
		await this.checkStash();
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
		await this.downloadScriptTemplate();
	}

	checkGitlabCiYml() {
		const cwdPath = process.cwd();
		const gitlabCiYmlFilePath = path.resolve(cwdPath, GITLAB_CI_YAML);

		if (!pathExistSync(gitlabCiYmlFilePath)) {
			throw new Error(`there is not a ${GITLAB_CI_YAML} file in the project root directory`);
		}
	}

	checkDockerFile() {}

	checkGitlabEnv() {}

	checkGitlabCiFile() {}

	async checkCliDeployPath() {
		const userHome = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
		const localDeployDir = path.resolve(userHome, LOCAL_DEPLOY_PATH);

		if (pathExistSync(localDeployDir)) {
			log.info('', `the local deploy directory is existed: ${localDeployDir}`);
		} else {
			fse.mkdirSync(localDeployDir);
			log.success('', `creates the local deploy directory(${localDeployDir}) successful`);
		}

		this.localDeployDir = localDeployDir;

		if (!pathExistSync(localDeployDir)) {
			throw new Error(`the local deploy directory is not existed: ${localDeployDir}`);
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

	async startDeployApp() {}

	async startDeployElectron() {}

	async startDeployWeb() {
		if (this.deployType === PM2) {
			await this.deployWebByPm2();
		} else {
			if (this.deployType === LOCAL_DOCKER) {
				await this.deployWebByDocker();
			} else if (this.deployType === GITLAB_DOCKER) {
				await this.deployWebByGitlabAndDocker();
			}
		}
	}

	async startDeployDatabase() {}

	async startDeployNginx() {}

	async deployWebByPm2() {}

	async deployWebByDocker() {
		// const { userName, userPwd, repoName, repoZone, repoNamespace, mirrorName, mirrorVersion } =
		// 	this.cmsInfo!;
		// const { userName, sshPort, serverIP } = this.serverInfo!;
		const dockerScriptDir = path.resolve(this.localDeployDir!, 'docker_scripts');

		if (!pathExistSync(dockerScriptDir)) {
			fse.ensureDirSync(dockerScriptDir);
		}
		await this.installScriptTemplate(dockerScriptDir);

		// const deployBuildDockerFile = path.resolve(this.localDeployDir!);

		// if (!pathExistSync(deployBuildDockerFile)) throw new Error(`the ${deployBuildDockerFile} file is not existed`)

		await this.ejsRender(
			{
				...this.cmsInfo,
				...this.serverInfo,
			},
			dockerScriptDir,
		);
		const buildDockerScriptFile = path.resolve(dockerScriptDir, 'build-docker.sh');
		// const buildScriptContent = readFile(buildDockerScriptFile) as string;

		if (pathExistSync(buildDockerScriptFile)) {
			await spawnAsync('chmod', ['+x', buildDockerScriptFile], {
				stdio: 'inherit',
				shell: true,
			});
			await spawnAsync('sh', [buildDockerScriptFile], {
				stdio: 'inherit',
				shell: true,
			});
		}
	}

	async deployWebByGitlabAndDocker() {}

	async getRemoteServerInfo() {
		const localServerInfoFile = path.resolve(this.localDeployDir!, SERVER_INFO_FILE);

		if (!pathExistSync(localServerInfoFile)) {
			this.serverInfo = await inquireServerInfo();

			const writeRes = writeSimpleObjToDotFile<ServerInfo>(localServerInfoFile, this.serverInfo);
			if (writeRes) {
				log.success('', `write server information to ${localServerInfoFile} successful`);
			}
		} else {
			const readServerInfo = readDotFileToObj<ServerInfo>(localServerInfoFile);

			if (readServerInfo) {
				this.serverInfo = readServerInfo;
			}
		}

		if (!this.serverInfo) {
			throw new Error('the server information is not exist');
		}
	}

	async getContainerMirrorServiceInfo() {
		const localCMSInfoFile = path.resolve(this.localDeployDir!, C_M_S_INFO_FILE);

		if (!pathExistSync(localCMSInfoFile)) {
			this.cmsInfo = await inquireContainerMirrorServiceInfo();

			const writeRes = writeSimpleObjToDotFile<ContainerMirrorServiceInfo>(
				localCMSInfoFile,
				this.cmsInfo,
			);
			if (writeRes) {
				log.success('', `write server information to ${localCMSInfoFile} successful`);
			}
		} else {
			const readCmsInfo = readDotFileToObj<ContainerMirrorServiceInfo>(localCMSInfoFile);

			if (readCmsInfo) {
				this.cmsInfo = readCmsInfo;
			}
		}

		if (!this.cmsInfo) {
			throw new Error('the container mirror service information is not exist');
		}
	}

	async downloadScriptTemplate() {
		const stageDir = process.env[NewEnvVariables.STAGE_CLI_HOME]!;
		const localPath = path.resolve(stageDir, STAGE_CLI_TEMPLATES_DIR);
		const storeDir = path.resolve(localPath, 'node_modules');
		const { npmName, version } = DEPLOY_SCRIPTS_PKG_INFO;

		const templatePkg = new CliPackage({
			localPath,
			storeDir,
			name: npmName,
			version,
		});
		log.verbose(
			'[cli-init]',
			`template downloading: {
      localPath: ${localPath},
      storeDir: ${storeDir},
      name: ${npmName},
      version: ${version},
    }`,
		);

		if (!(await templatePkg.exist())) {
			const spinner = spinnerInstance('template downloading...');
			// NOTE: if install's speed are quickly, hold on one second!
			await sleep();
			try {
				await templatePkg.install();
				spinner.stop(true);
				log.success('', 'Downloaded template successful!');
				this.templatePkg = templatePkg;
			} catch (error) {
				spinner.stop(true);
				throw error;
			}
			return;
		}

		const spinner = spinnerInstance('template updating...');
		// NOTE: if install's speed are quickly, hold on one second!
		await sleep();
		try {
			await templatePkg.update();
			spinner.stop(true);
			log.success('', 'Updated template successful!');
			this.templatePkg = templatePkg;
		} catch (error) {
			spinner.stop(true);
			throw error;
		}
	}

	async installScriptTemplate(destDir: string, fileName?: string) {
		// NOTE: copy template code to current directory
		const cacheFilePath = this.templatePkg?.cacheFilePath;

		if (!cacheFilePath) {
			log.warn('', 'The cached file path is not exist!');
			return;
		}

		const templatePath = path.resolve(cacheFilePath, 'template');
		fse.ensureDirSync(templatePath);

		const spinner = spinnerInstance('template installing...');
		await sleep();

		try {
			if (destDir) {
				// const sourceDir = fileName? path.resolve(templatePath, 'fileName') : templatePath;
				fse.copySync(templatePath, destDir);
				return;
			}

			throw new Error('the destDir param is required');
		} catch (err) {
			throw err;
		} finally {
			spinner.stop(true);
			log.success('', 'template installed successful!');
		}

		// await this.ejsRender();
	}

	ejsRender(data = {}, destDir?: string, ignoreFiles = EJS_IGNORE_FILES) {
		const cwdDir = process.cwd();
		const workDir = destDir ? destDir : cwdDir;
		return new Promise((resolve, reject) => {
			glob(
				'**',
				{
					cwd: workDir,
					ignore: ignoreFiles,
					nodir: true,
				},
				(err, files) => {
					if (err) {
						reject(err);
					}

					Promise.all(
						files.map((file) => {
							const filePath = path.join(workDir, file);

							return new Promise((innerResolve, innerReject) => {
								ejs.renderFile(filePath, data, (err, res) => {
									if (err) {
										return innerReject(err);
									}
									fse.writeFileSync(filePath, res);
									innerResolve(res);
								});
							});
						}),
					)
						.then(() => {
							resolve(true);
						})
						.catch((err) => {
							reject(err);
						});
				},
			);
		});
	}
}

function deployCmd(args: any[]) {
	return new DeployCommand(args);
}

export default deployCmd;
