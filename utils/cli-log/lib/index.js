"use strict";
/*
 * @Author: fujia
 * @Date: 2021-12-02 15:12:44
 * @LastEditTime: 2021-12-03 17:53:30
 * @LastEditors: fujia(as default)
 * @Description: According the environment to determine the log's level
 * @FilePath: /stage/utils/cli-log/src/index.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var npmlog_1 = __importDefault(require("npmlog"));
// adjust level and support customization
npmlog_1.default.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';
// customize heading
npmlog_1.default.heading = '[STAGE]';
// log.headingStyle = {
//   fg: 'blue',
//   bg: 'black'
// }
// add customized command
npmlog_1.default.addLevel('success', 2000, {
    fg: 'green',
    bold: true
});
exports.default = npmlog_1.default;
