/*
 * @Author: fujia
 * @Date: 2021-12-04 20:35:53
 * @LastEditTime: 2021-12-04 21:00:23
 * @LastEditors: fujia(as default)
 * @Description: A package compatible with Mac and window paths
 * @FilePath: /stage/utils/cross-path/src/index.ts
 */
import path from 'path';

const crossPath = (filePath: string) => {
  if (!filePath || typeof filePath !== 'string') return;

  const sep = path.sep;

  if (sep === '/') return filePath;

  return filePath.replace(/\\/g, '/');
};

export default crossPath;
