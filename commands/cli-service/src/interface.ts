import { DEPLOY_SCRIPTS_PKG_INFO } from './constants';

export type AppCategory = 'web' | 'app' | 'electron' | 'database' | 'docker-nginx';

export type DatabaseType = 'mongodb' | 'mysql';

export type DeployType = 'pm2' | 'local+docker';

export type UpgradeVersionType = 'major' | 'minor' | 'patch' | 'prerelease';

export interface ServerInfo {
	userName: string;
	sshPort: string;
	serverIP: string;
}

export interface ServerInfoJson {
	ipList: string[];
	serverList: ServerInfo[];
}

export interface ContainerMirrorServiceInfo {
	owner: string;
	userPwd: string;
	repoName: string;
	repoZone: string;
	repoNamespace: string;
	mirrorName: string;
	mirrorVersion: string;
}

export interface MirrorInfoJson {
	nameList: string[];
	mirrorInfoList: ContainerMirrorServiceInfo[];
}

export type DeployScriptTemplate = typeof DEPLOY_SCRIPTS_PKG_INFO;

export type BuildImageCmdOptions = Omit<ContainerMirrorServiceInfo, 'owner' | 'userPwd'>;

export type PullImageCmdOptions = ServerInfo & ContainerMirrorServiceInfo;

export type UpdateServiceCmdOptions = ServerInfo & BuildImageCmdOptions;

export type DeployViaPM2CmdOptions = ServerInfo & {
	appDir: string;
};
