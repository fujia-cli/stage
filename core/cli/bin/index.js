#! /usr/bin/env node

const importLocal = require('import-local');

if (importLocal(__filename)) {
  require('npmlog').info('cli', 'You are using local "stage" version.')
} else {
  require('../lib')(process.argv.slice(2));
}
