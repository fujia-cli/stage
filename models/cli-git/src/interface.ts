// import { AxiosInstance, AxiosRequestHeaders } from 'axios';

// export interface IGiteeRequest {
//   get: (
//     url: string,
//     params: object,
//     headers: AxiosRequestHeaders
//   ) => AxiosInstance;
//   post: () => AxiosInstance;
// }

export type GitPlatformType = 'Github' | 'Gitlab' | 'Gitee';

export type BranchType = 'release' | 'feature' | 'develop';

export type UpgradeVersionType = 'major' | 'minor' | 'patch';
