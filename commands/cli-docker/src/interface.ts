export type AppCategory = 'web' | 'app' | 'electron' | 'database' | 'docker-nginx';

export type DatabaseType = 'mongodb' | 'mysql';

export type DeployType = 'pm2' | 'local+docker';

export type UpgradeVersionType = 'major' | 'minor' | 'patch' | 'prerelease';

export type ServiceType = 'update' | 'deploy';

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
	repoZone: string;
	repoNamespace: string;
	mirrorName: string; // NOTE: the repo name equal to the mirror name in aliyun or tencent
	mirrorVersion?: string;
}

export interface MirrorInfoJson {
	nameList: string[];
	mirrorInfoList: ContainerMirrorServiceInfo[];
}

export type BuildImageCmdOptions = Omit<ContainerMirrorServiceInfo, 'owner' | 'userPwd'>;

export type PullImageCmdOptions = ServerInfo & ContainerMirrorServiceInfo;

export type UpdateServiceCmdOptions = ServerInfo &
	BuildImageCmdOptions & {
		serviceName: string;
	};

export type DeployServiceCmdOptions = {
	serviceName: string;
};

export type DeployViaPM2CmdOptions = ServerInfo & {
	appDir: string;
};
