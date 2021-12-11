
export type ProjectType = 'project' | 'component';

export type ProjectTypeList = 'vue'
  | 'nuxtJS'
  | 'react'
  | 'lib-rollup'
  | 'lib-webpack';

export type ComponentTypeList = 'vue'
  | 'react'
  | 'h5'
  | 'web-component'
  | 'react-native'
  | 'mini-program';

export interface ProjectInfo {
  projectType: ProjectType;
  projectName: ProjectTypeList;
  projectVersion: string;
  projectTemplate: string;
  packageName?: string;
}
