export const userNameRe =
	/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;

export const ip4Re = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

export const ip6Re = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/;

export const CLI_SERVICE_PATH = 'service';
export const SERVER_INFO_FILE = 'server-info.json';
export const SERVER_LIST_FILE = 'server-list.json';
export const STACK_LIST_FILE = 'stack-list.json';
export const C_M_S_INFO_FILE = 'cms-info.json'; // container mirror service information file
export const DOCKER_STACK_FILE = 'stack.yml';

export const UPGRADE_VERSION_CHOICES = ['patch', 'minor', 'major', 'prerelease'];

export const SERVICE_UPDATE = 'update';
export const SERVICE_DEPLOY = 'deploy';

/* deploy types */
export const LOCAL_DOCKER = 'local+docker';
export const GITLAB_DOCKER = 'gitlab+docker';
export const PM2 = 'pm2';

export const DEPLOY_TYPES = [
	{
		name: LOCAL_DOCKER,
		value: LOCAL_DOCKER,
	},
	// {
	// 	name: GITLAB_DOCKER,
	// 	value: GITLAB_DOCKER,
	// },
	{
		name: PM2,
		value: PM2,
	},
];

export const EJS_IGNORE_FILES = [];
