export const GITEE_BASE_URL = 'https://gitee.com/api/v5';

export const GITHUB_BASE_URL = 'https://api.github.com';

export const GITLAB_BASE_URL = '';

export const DEFAULT_CLI_HOME = '.stage-cli';
export const GIT_ROOT_DIR = '.git';
export const GIT_SERVER_FILE = '.git_server';
export const GIT_OWN_FILE = '.git_own';
export const GIT_LOGIN_FILE = '.git_login';
export const GIT_IGNORE_FILE = '.gitignore';
export const GITHUB = 'github';
export const GITEE = 'gitee';
export const GITLAB = 'gitlab';
export const REPO_OWNER_USER = 'user';
export const REPO_OWNER_ORG = 'org';
export const VERSION_RELEASE = 'release';
export const VERSION_FEATURE = 'feature';

export const GIT_TOKEN_FILE_MAP = {
  github: '.github_token',
  gitee: '.gitee_token',
  gitlab: '.gitlab_token',
};

export const INQUIRE_GIT_PLATFORMS = [{
  name: 'Github',
  value: GITHUB,
}, {
  name: 'Gitlab',
  value: GITLAB,
}, {
  name: 'Gitee',
  value: GITEE,
}];

export const GIT_OWNER_TYPE = [{
  name: 'individual',
  value: REPO_OWNER_USER,
}, {
  name: 'organization',
  value: REPO_OWNER_ORG,
}];

export const GIT_OWNER_TYPE_ONLY = [{
  name: 'individual',
  value: REPO_OWNER_USER,
}];

export const IGNORE_FILE_CONTENT = `.DS_Store
node_modules
/dist

# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.cache/
typings/
`;

export const VERSION_MAP_REG = {
  release: /.+?refs\/tags\/release\/(\d+\.\d+\.\d+)/g,
  feature: /.+?refs\/heads\/feature\/(\d+\.\d+\.\d+)/g,
  develop: /.+?refs\/heads\/dev\/(\d+\.\d+\.\d+)/g
};
