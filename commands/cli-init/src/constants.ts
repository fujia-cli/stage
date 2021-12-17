export const TEMPLATE_TYPES = [
  {
    name: 'default',
    value: 'default',
  },
  {
    name: 'custom',
    value: 'custom',
  },
  {
    name: 'remote',
    value: 'remote',
  },
];

export const PROJECT_TYPES = [
  {
    name: 'project',
    value: 'project',
  },
  {
    name: 'component',
    value: 'component',
  },
  {
    name: 'component-package',
    value: 'component-package',
  }
];

export const PROJECT_INQUIRE_LIST = [
  {
    name: 'vue',
    value: 'vue',
  },
  {
    name: 'nustJS',
    value: 'nustJS',
  },
  {
    name: 'vue-admin',
    value: 'vue-admin',
  },
  {
    name: 'react',
    value: 'react',
  },
  {
    name: 'react-native',
    value: 'react-native',
  },
  {
    name: 'electron',
    value: 'electron',
  },
  {
    name: 'lib-rollup',
    value: 'lib-rollup',
  },
  {
    name: 'lib-webpack',
    value: 'lib-webpack',
  },
  {
    name: 'mini-program',
    value: 'mini-program',
  },
  {
    name: 'mini-game',
    value: 'mini-game',
  },
];

export const COMPONENT_INQUIRE_LIST = [
  {
    value: 'react',
    name: 'react',
  },
  {
    value: 'vue',
    name: 'vue',
  },
  {
    value: 'h5',
    name: 'h5',
  },
  {
    value: 'web-component',
    name: 'web-component',
  },
  {
    value: 'react-native',
    name: 'react-native',
  },
  {
    value: 'mini-program',
    name: 'mini-program'
  },
];

export const DefaultProjectTemplate = [
  {
    _id: `STAGE_${Date.now()}`,
    name: '',
    version: 'latest',
    npmName: '',
    type: 'custom',
    installCommand: '',
    startCommand: '',
  }
];

export const DefaultComponentTemplate = [
  {
    _id: `STAGE_${Date.now()}`,
    name: '',
    version: 'latest',
    npmName: '',
  }
];

export const EJS_IGNORE_FILES = [
  'node_modules/**',
  'public/**'
];

export const WHITE_COMMANDS = [
  'npm',
  'cnpm',
  'yarn'
];
