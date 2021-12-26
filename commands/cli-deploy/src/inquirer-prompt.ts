import inquirer from "inquirer";

import {
  APP_CATEGORIES,
  DEPLOY_TYPES,
  DATABASE_TYPES,
  userNameRe,
  ip4Re,
  ip6Re,
} from "./constants";
import { AppCategory, ServerInfo, DatabaseType, DeployType } from "./interface";

export const inquireAppCategory = async () =>
  await inquirer.prompt<{
    appCategory: AppCategory;
  }>({
    type: "list",
    message: "please select the app category:",
    default: 0,
    choices: APP_CATEGORIES,
  });

export const inquireServerInfo = async () =>
  await inquirer.prompt<ServerInfo>([
    {
      type: "input",
      name: "userName",
      message: "please input the server user name:",
      default: "",
      validate(val: string) {
        const done = (this as any).async();

        setTimeout(function () {
          if (!userNameRe.test(val)) {
            done(`the ${val} is not a valid user name, please re-input!`);
            return false;
          }

          done(null, true);
        }, 300);
      },
    },
    {
      type: "number",
      name: "sshPort",
      message: "please input the ssh login port:",
      default: 22,
      validate(val: number) {
        const done = (this as any).async();

        setTimeout(function () {
          if (val <= 0 || val > 65535) {
            done("the ssh port should less than 65536, please re-input!");
            return false;
          }

          done(null, true);
        }, 300);
      },
    },
    {
      type: "input",
      name: "serverIP",
      message: "please input the server ip address:",
      default: "",
      validate(val: string) {
        const done = (this as any).async();

        setTimeout(function () {
          if (!ip4Re.test(val) && !ip6Re.test(val)) {
            done(`the ${val} is not valid, please re-input!`);
            return false;
          }

          done(null, true);
        }, 300);
      },
    },
  ]);

export const inquireDatabaseType = async () =>
  await inquirer.prompt<{
    databaseType: DatabaseType;
  }>({
    type: "list",
    message: "please the database type:",
    default: 0,
    choices: DATABASE_TYPES,
  });

export const inquireDeployType = async () =>
  await inquirer.prompt<{
    deployType: DeployType;
  }>({
    type: "list",
    message: "please select the deploy type:",
    default: 0,
    choices: DEPLOY_TYPES,
  });
