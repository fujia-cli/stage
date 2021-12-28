import { DEPLOY_SCRIPTS_PKG_INFO } from './constants';

export type AppCategory = 'web' | 'app' | 'electron' | 'database' | 'docker-nginx';

export type DatabaseType = 'mongodb' | 'mysql';

export type DeployType = 'pm2' | 'local+docker' | 'gitlab+docker';

export interface ServerInfo {
	userName: string;
	sshPort: string;
	serverIP: string;
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

export type DeployScriptTemplate = typeof DEPLOY_SCRIPTS_PKG_INFO;
