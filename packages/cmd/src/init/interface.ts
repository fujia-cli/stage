export type TemplateType = 'default' | 'custom' | 'remote';

export type ProjectType = 'project' | 'component-package' | 'component';

export type ProjectCategory = 'web' | 'app' | 'library' | 'mini-program';

export type ProjectTypeList =
	| 'vue'
	| 'nuxtJS'
	| 'vue-admin'
	| 'react'
	| 'react-native'
	| 'electron'
	| 'lib-rollup'
	| 'lib-webpack'
	| 'mini-program'
	| 'mini-game';

export type ComponentTypeList =
	| 'vue'
	| 'react'
	| 'h5'
	| 'web-component'
	| 'react-native'
	| 'mini-program';

// export interface ComponentTemplate {
//   _id: string;
//   name: string;
//   version: string;
//   npmName: string;
// }

// export interface ComponentInfo {
//   packageName?: string;
//   projectType: Extract<ProjectType, 'component'>;
//   componentName: ComponentTypeList;
//   version: string;
//   componentTemplate: string;
// }
export interface ProjectTemplate {
	_id?: string;
	name: string;
	version: string;
	npmName: string;
	installCommand: string;
	startCommand: string;
}

export interface ProjectInfo {
	packageName?: string;
	projectName?: string;
	version: string;
	projectTemplate?: string;
}

export interface ITemplate {
	data: Array<ProjectTemplate>;
}

export interface CustomPkgInfoJson {
	nameList: string[];
	pkgList: ProjectTemplate[];
}
