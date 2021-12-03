"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cli_log_1 = __importDefault(require("@fujia/cli-log"));
var semver_1 = __importDefault(require("semver"));
var safe_1 = require("colors/safe");
var home_or_tmp_1 = __importDefault(require("home-or-tmp"));
// import rootCheck from 'root-check';
var pkg = require('../package.json');
var constant_1 = require("./constant");
function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
    }
    catch (e) {
        cli_log_1.default.error(e.message);
    }
}
exports.default = core;
function checkUserHome() {
    console.log(home_or_tmp_1.default);
}
function checkRoot() {
    //   rootCheck();
}
function checkNodeVersion() {
    var curNodeVersion = process.version;
    if (semver_1.default.lt(curNodeVersion, constant_1.LOWEST_NODE_VERSION)) {
        throw new Error((0, safe_1.red)("[stage] need the lowest version of node.js is ".concat(constant_1.LOWEST_NODE_VERSION, ", but now obtained ").concat(curNodeVersion, ".")));
    }
}
function checkPkgVersion() {
    cli_log_1.default.info('core/cli', pkg.version);
}
