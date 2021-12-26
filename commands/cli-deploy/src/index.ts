import path from "path";
import CliCommand from "@fujia/cli-command";
import log from "@fujia/cli-log";
import fse from "fs-extra";
import { pathExistSync } from "@fujia/check-path";
import simpleGit, { SimpleGit } from "simple-git";

import {
  inquireAppCategory,
  inquireServerInfo,
  DatabaseType,
  inquireDatabaseType,
  DeployType,
  inquireDeployType,
} from "./inquirer-prompt";

export class DeployCommand extends CliCommand {
  git: SimpleGit;
  branch: string;
  constructor(args: any[]) {
    super(args);
    this.git = simpleGit();
    this.branch = "main";
  }

  init() {
    log.verbose("[cli-deploy]", `init`);
  }

  async exec() {
    try {
    } catch (err: any) {
      log.error("[cli-deploy]", `err?.message`);
      throw err;
    }
  }

  async prepare() {
    await this.checkMainBranch();
    await this.checkNotCommitted();
    await this.checkStash();
  }

  async checkMainBranch() {
    const isRepo = await this.git.checkIsRepo();

    if (!isRepo) {
      throw new Error("the current working directory is invalid git repository");
    }

    const branch = await this.git.branch();
    if (!["main", "master"].includes(branch.current)) {
      throw new Error(
        `the current git branch is not main or master, please run the command: "git checkout main", then try again!`
      );
    }
    this.branch = branch.current;
    log.success("[cli-release]", `current git branch: ${branch.current}`);
  }

  async checkNotCommitted() {
    const status = await this.git.status();
    const { not_added, created, deleted, modified, renamed } = status;
    const isNotEmptyStatus =
      not_added.length > 0 ||
      created.length > 0 ||
      deleted.length > 0 ||
      modified.length > 0 ||
      renamed.length > 0;

    if (isNotEmptyStatus) {
      throw new Error("the git status is not empty, please handle manually!");
    }

    log.success("[cli-release]", "the git status is empty");
  }

  async checkStash() {
    log.info("[cli-git]", "check stash records");

    const stashList = await this.git.stashList();

    if (stashList.all.length > 0) {
      await this.git.stash(["pop"]);
      log.success("[cli-git]", "stash pop successful");
    }

    await this.git.push("origin", this.branch);
    log.success("cli-release", "execute push operations successful before publish");
  }
}

function deployCmd(args: any[]) {
  return new DeployCommand(args);
}

export default deployCmd;
