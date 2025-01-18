#! /usr/bin/env node

const importLocal = require("import-local");
const semver = require("semver");

// NOTE: why is v14.0.0? seeing: https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#promises-api
const LOWEST_NODE_VERSION = "14.0.0";

(function checkNodeVersion() {
  const curNodeVersion = process.version;

  if (semver.lt(curNodeVersion, LOWEST_NODE_VERSION)) {
    require("npmlog").error(
      `Oops! the stage cli requires node.js version greater than or equal to v${LOWEST_NODE_VERSION}, however now that is v${curNodeVersion}, please upgrade node.js version!`
    );
    process.exit(0);
  }
})();

if (importLocal(__filename)) {
  require("npmlog").info("cli", 'You are using local "stage" version.');
} else {
  require("../lib").run(process.argv.slice(2));
}
