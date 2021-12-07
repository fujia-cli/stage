export interface ConstructorOptions {
  // file path of package
  localPath: string;
  // cache of path
  storeDir?: string;
  // name of package
  name: string;
  // version of package
  version: string;
}

export interface ICliPackage {
  // file path of package
  localPath: string;
  // cache of path
  storeDir?: string;
  // name of package
  pkgName: string;
  // version of package
  pkgVersion: string;
  // cache of path
  cacheFilePath: string;
  // generate a cached file path by specific version
  genCacheFilePath: (version: string) => string;
  // prepare for something
  prepare: () => void;
  // check the package is exist
  exist: () => Promise<boolean>;
  // install package
  install: () => Promise<any>;
  // update package
  update: () => void;
  // obtain the path of entry point file
  getEntryFilePath: () => void;
}
