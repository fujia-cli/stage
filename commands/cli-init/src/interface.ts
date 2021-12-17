
export type TemplateType = 'default' | 'custom' | 'remote';

export type ProjectType = 'project' | 'component-package' | 'component';

export type ProjectTypeList = 'vue'
  | 'nuxtJS'
  | 'vue-admin'
  | 'react'
  | 'react-native'
  | 'electron'
  | 'lib-rollup'
  | 'lib-webpack'
  | 'mini-program'
  | 'mini-game'

export type ComponentTypeList = 'vue'
  | 'react'
  | 'h5'
  | 'web-component'
  | 'react-native'
  | 'mini-program';

export interface ComponentTemplate {
  _id: string;
  name: string;
  version: string;
  npmName: string;
}

export interface ComponentInfo {
  packageName?: string;
  projectType: Extract<ProjectType, 'component'>;
  componentName: ComponentTypeList;
  componentVersion: string;
  componentTemplate: string;
}
export interface ProjectTemplate extends ComponentTemplate {
  type: string;
  installCommand: string;
  startCommand: string;
}

export interface ProjectInfo {
  packageName?: string;
  projectType: Exclude<ProjectType, 'component'>;
  projectName: ProjectTypeList;
  projectVersion: string;
  projectTemplate: string;
}

export interface ITemplate {
  data: Array<ProjectTemplate | ComponentTemplate>
}
