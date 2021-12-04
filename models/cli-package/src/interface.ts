export interface ConstructorOptions {
  // file path of package
  localPath: string;
  // store path of package
  storePath: string;
  // name of package
  name: string;
  // version of package
  version: string;
}

export interface ICliPackage {
  // file path of package
  localPath: string;
  // store path of package
  storePath: string;
  // name of package
  packageName: string;
  // version of package
  packageVersion: string;
  // check the package is exist
  exist: () => void;
  // install package
  install: () => void;
  // update package
  update: () => void;
  // obtain the path of entry point file
  getEntryFilePath: () => void;
}
