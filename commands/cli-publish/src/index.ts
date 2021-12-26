/*
 * @Author: fujia
 * @Date: 2021-12-11 21:10:04
 * @LastEditTime: 2021-12-26 10:12:17
 * @LastEditors: fujia(as default)
 * @Description: A package to achieve deploy flows for stage cli.
 * @FilePath: /stage/commands/cli-publish/src/index.ts
 */
import path from "path";
import CliCommand from "@fujia/cli-command";
import log from "@fujia/cli-log";
import fse from "fs-extra";
import { pathExistSync } from "@fujia/check-path";
import CliGit from "@fujia/cli-git";

import { PkgInfo, PublishCmdOptions } from "./interface";

export class PublishCommand extends CliCommand {
  pkgInfo?: PkgInfo;
  options?: PublishCmdOptions;
  constructor(args: any[]) {
    super(args);
  }

  init() {
    // NOTE: handle params
    log.verbose("[cli-publish]", "", this.argv);

    this.options = {
      refreshRepo: this.cmd?.refreshRepo,
      refreshOwner: this.cmd?.refreshOwner,
      refreshToken: this.cmd?.refreshToken,
    };
  }

  async exec() {
    /**
     * NOTE: steps
     * 1, initial
     * 2, git flow automatic
     * 3, local build & publish or cloud build & publish
     */
    try {
      const startTime = new Date().getTime();
      this.prepare();

      if (this.pkgInfo && this.options) {
        const git = new CliGit(this.pkgInfo, this.options); // new instance of CliGit
        await git.prepare(); // automatic prepare for commit operation and initial code repository
        await git.commit(); // automatic commit code
      }

      const endTime = new Date().getTime();
      log.info("", `this release took time: ${Math.floor((endTime - startTime) / 1000)}secs`);
    } catch (err: any) {
      log.error("", err?.message);

      if (process.env.LOG_LEVEL === "verbose") {
        console.log(err);
      }
    }
  }

  prepare() {
    /**
     * NOTE: To-Dos
     *
     * 1, check if a npm project
     * 2, check if include some fields:  name, version, and build script etc.
     */
    const cwdPath = process.cwd();
    const pkgJsonPath = path.resolve(cwdPath, "package.json");
    log.verbose("[cli-publish]", pkgJsonPath);

    if (!pathExistSync(pkgJsonPath)) {
      throw new Error("The file of package.json is not exist!");
    }

    const pkgDetail = fse.readJSONSync(pkgJsonPath);
    const { name, version, scripts } = pkgDetail;
    if (!name || !version || !scripts || !scripts.build) {
      throw new Error(
        "The file of package.json is invalid, which should include these fields: name, version, scripts and build command!"
      );
    }
    this.pkgInfo = {
      projectName: name,
      version,
      sourceDir: cwdPath,
    };
  }
}

function publishCmd(args: any[]) {
  return new PublishCommand(args);
}

export default publishCmd;
