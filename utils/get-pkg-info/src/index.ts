/*
 * @Author: fujia
 * @Date: 2021-12-03 19:45:46
 * @LastEditTime: 2022-01-21 15:30:14
 * @LastEditors: fujia(as default)
 * @Description: Obtain the package info via npm's api.
 * @FilePath: /stage/utils/get-pkg-info/src/index.ts
 */

import axios from 'axios';
import urlJoin from 'url-join';
import semver from 'semver';
import path from 'path';
import fse from 'fs-extra';
import { getNpmRegistry } from '@fujia/cli-utils';
import log from '@fujia/cli-log';
import { pathExistSync } from '@fujia/check-path';

// compatible with poor or unstable networks
const AXIOS_TIMEOUT = 60 * 1000;

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

	const verifyRegistry = registry || getNpmRegistry();
	const pkgUrl = urlJoin(verifyRegistry, pkgName);

	log.verbose(
		'[cli-utils]',
		`
			pkgName: ${pkgName}
			pkgUrl: ${pkgUrl}
		`
	);

	return axios
		.get(pkgUrl, {
			timeout: AXIOS_TIMEOUT,
		})
		.then((res) => {
			if (res.status === 200) {
				return res.data;
			}

			return null;
		})
		.catch((err) => {
			return Promise.reject(err);
		});
}

export function getSemverVersions(versions: string[], curVersion?: string) {
	if (curVersion) {
		return versions
			.filter((v) => semver.satisfies(v, `^${curVersion}`))
			.sort((a, b) => (semver.gt(b, a) ? 1 : -1));
	}

	return versions.sort((a, b) => (semver.gt(b, a) ? 1 : -1));
}

export async function getLatestVersion(pkgName: string, curVersion?: string, registry?: string) {
	const versions = await getPkgVersions(pkgName, registry);
	const gtCurOrAllVersions = getSemverVersions(versions, curVersion);

	if (gtCurOrAllVersions && gtCurOrAllVersions.length > 0) {
		return gtCurOrAllVersions[0];
	}

	return null;
}

export const getInfoFromPkgJson = (rootPath?: string) => {
	const cwdPath = rootPath || process.cwd();
	const pkgJsonPath = path.resolve(cwdPath, 'package.json');

	if (!pathExistSync(pkgJsonPath)) {
		throw new Error('The file of package.json is not exist!');
	}

	const pkgInfo = fse.readJSONSync(pkgJsonPath);

	const { name, version, scripts } = pkgInfo;

	if (!name || !version || !scripts) {
		throw new Error(
			'The package.json is invalid, which should include these fields: name, version, scripts.',
		);
	}

	return pkgInfo;
};
