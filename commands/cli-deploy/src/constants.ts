export const userNameRe =
  /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;

export const ip4Re = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

export const ip6Re = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/;

/* app categories */
export const WEB = "web";
export const DATABASE = "database";
export const DOCKER_NGINX = "docker-nginx";
export const APP = "app";
export const ELECTRON = "electron";

/* deploy types */
export const LOCAL_DOCKER = "local+docker";
export const GITLAB_DOCKER = "gitlab+docker";
export const PM2 = "pm2";

/* database types */
export const MONGODB = "mongodb";
export const MYSQL = "mysql";

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
