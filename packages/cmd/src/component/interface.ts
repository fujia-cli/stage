import { TEMPLATE_MAP_PKG } from './constants';

export type ComponentTypeList = keyof typeof TEMPLATE_MAP_PKG;

export interface ComponentTemplate {
	_id: string;
	name: string;
	version: string;
	npmName: string;
}

export interface ComponentInfo {
	packageName?: string;
	componentName: ComponentTypeList;
	version: string;
	componentTemplate: string;
}
