/*
 * @Author: fujia
 * @Date: 2021-12-02 15:12:44
 * @LastEditTime: 2021-12-02 15:44:48
 * @LastEditors: fujia(as default)
 * @Description: According the environment to determine the log's level
 * @FilePath: /stage/utils/cli-log/lib/index.js
 */
'use strict';

const log = require('npmlog');

// adjust level and support customization
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

// customize heading
log.heading = '[STAGE]';
// log.headingStyle = {
//   fg: 'blue',
//   bg: 'black'
// }

// add customized command
log.addLevel('success', 2000, {
  fg: 'green',
  bold: true
});

module.exports = log;
