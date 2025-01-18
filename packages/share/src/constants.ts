// NOTE: List all added env variable
export const enum NewEnvVariables {
  STAGE_CLI_LOCAL = 'STAGE_CLI_LOCAL',
  LOG_LEVEL = 'LOG_LEVEL',
  STAGE_CLI_HOME = 'STAGE_CLI_HOME',
  USER_HOME = 'USER_HOME',
}

export const STAGE_CLI_TEMPLATES_DIR = 'templates';

export const EJS_IGNORE_FILES = [
  'node_modules/**',
  'public/**',
  'static/**',
  'store/**',
];

export const NPM_REGISTRY = 'https://registry.npmjs.org';

export const CUSTOM_TPL_FILE = 'custom-template.json';

export const STAGE_CONFIG_FILE = '.config';
