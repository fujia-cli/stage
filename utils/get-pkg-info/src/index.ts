/*
 * @Author: fujia
 * @Date: 2021-12-03 19:45:46
 * @LastEditTime: 2021-12-19 15:35:33
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

export function getSemverVersions(versions: string[], curVersion?: string) {
  if (curVersion) {
    return versions
      .filter(v => semver.satisfies(v, `^${curVersion}`))
      .sort((a, b) => (semver.gt(b, a)) ? 1 : -1);
  }

  return versions.sort((a, b) => (semver.gt(b, a)) ? 1 : -1);
}

export async function getLatestVersion(
  pkgName: string,
  curVersion?: string,
  registry?: string
) {
  const versions = await getPkgVersions(pkgName, registry);
  const gtCurOrAllVersions = getSemverVersions(versions, curVersion);

  if (gtCurOrAllVersions && gtCurOrAllVersions.length > 0) {
    return gtCurOrAllVersions[0];
  }

  return null;
}

export function getDefaultRegistry(origin = false) {
  return origin ? 'https://registry.npmmirror.com' : 'https://registry.npmjs.org';
}
