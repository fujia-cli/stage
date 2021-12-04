/*
 * @Author: fujia
 * @Date: 2021-12-04 15:48:52
 * @LastEditTime: 2021-12-04 16:16:07
 * @LastEditors: fujia(as default)
 * @Description:
 * @FilePath: /stage/core/cli-exec/src/index.ts
 */

function exec() {
  console.log('exec');
  console.log(process.env.STAGE_CLI_LOCAL);
}

export default exec;
