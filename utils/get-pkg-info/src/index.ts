/*
 * @Author: fujia
 * @Date: 2021-12-03 19:45:46
 * @LastEditTime: 2021-12-03 20:52:50
 * @LastEditors: fujia(as default)
 * @Description: Obtain the package info via npm's api.
 * @FilePath: /stage/utils/get-pkg-info/src/index.ts
 */

import axios from 'axios';
import urlJoin from 'url-join';
import semver from 'semver';

// simple to define the shape of package info
export interface PkgInfo {
  _id: string;
  _rev?: string;
  name: string;
  'dist-tags'?: {
    latest?: string;
  };
  versions: {
    [key: string]: unknown;
  };
  time?: unknown;
  maintainers?: unknown[];
  description?: string;
  homepage?: string;
  keywords?: string[];
  repository: unknown;
  author?: unknown;
  bugs?: unknown;
  license?: string;
  readme?: string;
  [key: string]: unknown;
}

export async function getPkgVersions(pkgName: string, registry?: string) {
  const pkgInfo = await getPkgInfo(pkgName, registry);

  if (pkgInfo) {
    return Object.keys(pkgInfo.versions);
  }

  return [];
}

export function getPkgInfo(pkgName: string, registry?: string): Promise<PkgInfo> | null {
  if (!pkgName) return null;

  const verifyRegistry = registry || getDefaultRegistry();
  const infoUrl = urlJoin(verifyRegistry, pkgName);

  return axios.get(infoUrl)
    .then(res => {
      if (res.status === 200) {
        return res.data;
      }

      return null;
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

export function getSemverVersions(curVersion: string, versions: string[]) {
  return versions
    .filter(v => semver.satisfies(v, `^${curVersion}`))
    .sort((a, b) => (semver.gt(b, a)) ? 1 : -1);
}

export async function getLatestVersion(
  curVersion: string,
  pkgName: string,
  registry?: string
) {
  const versions = await getPkgVersions(pkgName, registry);
  const gtCurVersions = getSemverVersions(curVersion, versions);

  if (gtCurVersions && gtCurVersions.length > 0) {
    return gtCurVersions[0];
  }

  return null;
}

function getDefaultRegistry(origin = false) {
  return origin ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}
