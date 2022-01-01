export const TEMPLATE_MAP_PKG = {
	react: {
		_id: `STAGE_${Date.now()}`,
		name: 'react',
		version: 'latest',
		npmName: '@fujia/react-component-template',
	},
	vue: {
		_id: `STAGE_${Date.now()}`,
		name: 'vue',
		version: 'latest',
		npmName: '@fujia/vue-component-template',
	},
	h5: {
		_id: `STAGE_${Date.now()}`,
		name: 'h5',
		version: 'latest',
		npmName: '@fujia/h5-component-template',
	},
	'web-component': {
		_id: `STAGE_${Date.now()}`,
		name: 'web-component',
		version: 'latest',
		npmName: '@fujia/web-component-template',
	},
	'react-native': {
		_id: `STAGE_${Date.now()}`,
		name: 'react-native',
		version: 'latest',
		npmName: '@fujia/react-native-component-template',
	},
	wechat: {
		_id: `STAGE_${Date.now()}`,
		name: 'wechat',
		version: 'latest',
		npmName: '@fujia/wechat-component-template',
	},
};

export const TEMPLATE_TYPE_LIST = Object.keys(TEMPLATE_MAP_PKG);

export const templateFileNameRe = /^(__template__\.).*[mdx|tsx|]$/i;
