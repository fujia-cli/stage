import path from "path";
import CliCommand from "@fujia/cli-command";
import log from "@fujia/cli-log";
import fse from "fs-extra";
import { pathExistSync } from "@fujia/check-path";
import simpleGit, { SimpleGit } from "simple-git";

import {
  inquireAppCategory,
  inquireServerInfo,
  inquireDatabaseType,
  inquireDeployType,
} from "./inquirer-prompt";
import { DatabaseType, DeployType, AppCategory, ServerInfo } from "./interface";
import {
  WEB,
  DATABASE,
  DOCKER_NGINX,
  APP,
  ELECTRON,
  LOCAL_DOCKER,
  GITLAB_DOCKER,
  PM2,
  MONGODB,
  MYSQL,
} from "./constants";

export class DeployCommand extends CliCommand {
  git: SimpleGit;
  branch: string;
  appCategory: AppCategory;
  databaseType: DatabaseType;
  serverInfo?: ServerInfo;
  constructor(args: any[]) {
    super(args);
    this.git = simpleGit();
    this.branch = "main";
    this.appCategory = "web";
    this.databaseType = "mongodb";
    this.serverInfo = undefined;
  }

  async init() {
    await this.prepare();

    this.appCategory = (await inquireAppCategory()).appCategory;

    if (this.appCategory === "web") {
      const deployType = (await inquireDeployType()).deployType;

      if ([LOCAL_DOCKER, GITLAB_DOCKER].includes(deployType)) {
        this.checkDockerEnv();
      }
    } else if (this.appCategory === "database") {
      this.checkDockerEnv();
      this.databaseType = (await inquireDatabaseType()).databaseType;
    } else if (this.appCategory === "docker-nginx") {
      this.checkDockerEnv();
    }

    if ([WEB, DATABASE, DOCKER_NGINX].includes(this.appCategory)) {
      this.serverInfo = await inquireServerInfo();
    }
  }

  async exec() {
    try {
    } catch (err: any) {
      log.error("", `err?.message`);
      throw err;
    }
  }

  async prepare() {
    await this.checkMainBranch();
    await this.checkNotCommitted();
    await this.checkStash();
  }

  checkDockerEnv() {
    log.info(
      "",
      "please make sure the docker environment is configured on the local host and the remote server"
    );
  }

  checkDockerFile() {}

  checkGitlabEnv() {}

  checkGitlabCiFile() {}

  async checkMainBranch() {
    const isRepo = await this.git.checkIsRepo();

    if (!isRepo) {
      throw new Error("the current working directory is invalid git repository");
    }

    const branch = await this.git.branch();
    if (!["main", "master"].includes(branch.current)) {
      throw new Error(
        `the current git branch is not main or master, please run the command: 'git checkout main', then try again!`
      );
    }
    this.branch = branch.current;
    log.success("", `current git branch: ${branch.current}`);
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

    log.success("", "the git status is empty");
  }

  async checkStash() {
    log.info("", "check stash records");

    const stashList = await this.git.stashList();

    if (stashList.all.length > 0) {
      await this.git.stash(["pop"]);
      log.success("", "stash pop successful");
    }

    await this.git.push("origin", this.branch);
    log.success("", "execute push operations successful before publish");
  }
}

function deployCmd(args: any[]) {
  return new DeployCommand(args);
}

export default deployCmd;
