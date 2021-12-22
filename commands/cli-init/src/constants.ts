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

export const INQUIRE_PROJECTS = [
  {
    name: 'web',
    value: 'web',
  },
  {
    name: 'app',
    value: 'app',
  },
  {
    name: 'library',
    value: 'library',
  },
  {
    name: 'mini-program',
    value: 'mini-program',
  },
];

export const INQUIRE_WEB_LIST = [
  {
    name: 'vue',
    value: 'vue',
  },
  {
    name: 'vue-next',
    value: 'vue-next',
  },
  {
    name: 'nuxtjs',
    value: 'nuxtjs',
  },
  {
    name: 'vue-admin',
    value: 'vue-admin',
  },
  {
    name: 'react',
    value: 'react',
  },
];

export const INQUIRE_APP_LIST = [
  {
    name: 'react-native',
    value: 'react-native',
  },
  {
    name: 'electron-rect',
    value: 'electron-rect',
  },
  {
    name: 'electron-antd',
    value: 'electron-antd',
  },
  {
    name: 'electron-element',
    value: 'electron-element',
  },
];

export const INQUIRE_LIB_LIST = [
  {
    name: 'rollup',
    value: 'rollup',
  },
  {
    name: 'webpack',
    value: 'webpack',
  },
];

export const INQUIRE_MINI_PROGRAMS = [
  {
    name: 'wechat',
    value: 'wechat',
  },
  {
    name: 'mini-game',
    value: 'mini-game',
  },
  {
    name: 'alipay',
    value: 'alipay',
  }
];

export const INQUIRE_COMPONENTS = [
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

export const EJS_IGNORE_FILES = [
  'node_modules/**',
  'public/**',
  'static/**',
  'store/**'
];

export const WHITE_COMMANDS = [
  'npm',
  'cnpm',
  'yarn'
];

export const DEFAULT_WEB_TEMPLATES = [
  {
    _id: `STAGE_${Date.now()}`,
    name: 'vue',
    version: 'latest',
    npmName: '@fujia/vue2-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'npm run serve',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'vue-next',
    version: 'latest',
    npmName: '@fujia/vue-next-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'npm run serve',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'nuxtjs',
    version: 'latest',
    npmName: '@fujia/nuxtjs-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'npm run dev',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'vue-admin',
    version: 'latest',
    npmName: '@fujia/vue2-admin-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'npm start',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'react',
    version: 'latest',
    npmName: '@fujia/react-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'npm start',
  },
];

export const DEFAULT_APP_TEMPLATES = [
  {
    _id: `STAGE_${Date.now()}`,
    name: 'react-native',
    version: 'latest',
    npmName: '@fujia/react-native-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'yarn ios',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'electron-rect',
    version: 'latest',
    npmName: '@fujia/electron-rect-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'npm start',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'electron-antd',
    version: 'latest',
    npmName: '@fujia/electron-antd-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'npm start',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'electron-element',
    version: 'latest',
    npmName: '@fujia/electron-element-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: 'npm start',
  },
];

export const DEFAULT_LIBRARY_TEMPLATES = [
  {
    _id: `STAGE_${Date.now()}`,
    name: 'library-rollup',
    version: 'latest',
    npmName: '@fujia/library-rollup-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: '',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'library-webpack',
    version: 'latest',
    npmName: '@fujia/library-webpack-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: '',
  },
];

export const DEFAULT_MINI_PROGRAM_TEMPLATES = [
  {
    _id: `STAGE_${Date.now()}`,
    name: 'wechat',
    version: 'latest',
    npmName: '@fujia/wechat-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: '',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'mini-game',
    version: 'latest',
    npmName: '@fujia/mini-game-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: '',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'alipay',
    version: 'latest',
    npmName: '@fujia/alipay-template',
    installCommand: 'npm install --registry=https://registry.npmmirror.com',
    startCommand: '',
  },
];

export const DEFAULT_COMPONENT_TEMPLATES = [
  {
    _id: `STAGE_${Date.now()}`,
    name: 'react',
    version: 'latest',
    npmName: '@fujia/react-component-template',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'vue',
    version: 'latest',
    npmName: '@fujia/vue-component-template',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'h5',
    version: 'latest',
    npmName: '@fujia/h5-component-template',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'web-component',
    version: 'latest',
    npmName: '@fujia/web-component-template',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'react-native',
    version: 'latest',
    npmName: '@fujia/react-native-component-template',
  },
  {
    _id: `STAGE_${Date.now()}`,
    name: 'wechat',
    version: 'latest',
    npmName: '@fujia/wechat-component-template',
  },
];

export const STAGE_CLI_TEMPLATES_DIR = 'templates';
