/*
 * @Author: fujia
 * @Date: 2021-12-07 09:42:37
 * @LastEditTime: 2021-12-26 10:12:56
 * @LastEditors: fujia(as default)
 * @Description:
 * @FilePath: /stage/models/cli-command/src/index.ts
 */
import log from "@fujia/cli-log";
import { StageCliCmd } from "@fujia/cli-utils";

class CliCommand {
  protected argv: any[];
  protected cmd?: StageCliCmd;
  runner: Promise<unknown>;
  constructor(args: any[]) {
    if (!args || args.length < 1) {
      throw new Error("The params of args can not be undefined or empty.");
    }

    this.argv = args;
    this.runner = this.genRunner();
  }

  init() {
    throw new Error("The method of init must be implemented.");
  }

  exec() {
    throw new Error("The method of exec must be implemented.");
  }

  initArgs() {
    this.cmd = this.argv[this.argv.length - 1];
    this.argv = this.argv.slice(0, this.argv.length - 1);
  }

  genRunner() {
    return new Promise((_, reject) => {
      let chain = Promise.resolve();

      chain = chain.then(() => this.initArgs());

      chain = chain.then(() => this.init());

      chain = chain.then(() => this.exec());

      chain.catch((err) => {
        log.error("[cli-command]", err?.message);
        log.verbose("[cli-command]", err);
        reject(err);
      });
    });
  }
}

export default CliCommand;
