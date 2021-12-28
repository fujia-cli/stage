export const userNameRe =
	/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;

export const ip4Re = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

export const ip6Re = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/;

export const LOCAL_DEPLOY_PATH = 'deploy';
export const SERVER_INFO_FILE = '.server_info';
export const C_M_S_INFO_FILE = '.cms_info'; // container mirror service information file
export const DOCKER_FILE = 'Dockerfile';
export const DOCKER_IGNORE_FILE = '.dockerignore';
export const GITLAB_CI_YAML = '.gitlab-ci.yml';
export const STAGE_CLI_TEMPLATES_DIR = 'templates';

export const DEPLOY_SCRIPTS_PKG_INFO = {
	_id: `STAGE_${Date.now()}`,
	name: 'deploy-scripts-template',
	version: 'latest',
	npmName: '@fujia/deploy-scripts-template',
	installCommand: '',
	startCommand: 'string',
};

/* app categories */
export const WEB = 'web';
export const DATABASE = 'database';
export const DOCKER_NGINX = 'docker-nginx';
export const APP = 'app';
export const ELECTRON = 'electron';

/* deploy types */
export const LOCAL_DOCKER = 'local+docker';
export const GITLAB_DOCKER = 'gitlab+docker';
export const PM2 = 'pm2';

/* database types */
export const MONGODB = 'mongodb';
export const MYSQL = 'mysql';

export const APP_CATEGORIES = [
	{
		name: WEB,
		value: WEB,
	},
	// {
	//   name: APP,
	//   value: APP,
	// },
	// {
	//   name: ELECTRON,
	//   value: ELECTRON,
	// },
	{
		name: DATABASE,
		value: DATABASE,
	},
	{
		name: DOCKER_NGINX,
		value: DOCKER_NGINX,
	},
];

export const DEPLOY_TYPES = [
	{
		name: LOCAL_DOCKER,
		value: LOCAL_DOCKER,
	},
	{
		name: GITLAB_DOCKER,
		value: GITLAB_DOCKER,
	},
	{
		name: PM2,
		value: PM2,
	},
];

export const DATABASE_TYPES = [
	{
		name: MONGODB,
		value: MONGODB,
	},
	{
		name: MYSQL,
		value: MYSQL,
	},
];

export const EJS_IGNORE_FILES = [];
