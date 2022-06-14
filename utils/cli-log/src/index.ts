/*
 * @Author: fujia
 * @Date: 2021-12-02 15:12:44
 * @LastEditTime: 2022-06-14 09:53:55
 * @LastEditors: fujia(as default)
 * @Description: According the environment to determine the log's level
 * @FilePath: /stage/utils/cli-log/src/index.ts
 */

import log, { Logger } from 'npmlog';

export interface CliLog extends Logger {
	success: (prefix: string, message: string, ...args: any[]) => void;
}

// adjust level and support customization
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

// customize heading
log.heading = '[stage]';
// log.headingStyle = {
//   fg: 'blue',
//   bg: 'black'
// }

// add customized command
log.addLevel('success', 2000, {
	fg: 'green',
	bold: true,
});

const enhanceLog = log as CliLog;

export default enhanceLog;
