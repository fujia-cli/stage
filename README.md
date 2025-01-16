<div align="center">
  <a href="https://github.com/fujia-cli/stage" target="_blank">
    <img alt="stage logo" width="200" src="https://images-1254102905.file.myqcloud.com/assets/stage.svg"/>
  </a>
</div>

<div align="center">
  <h1>@fujia/stage</h1>
</div>

<div align="center">

A CLI tool makes application development simple and powerful.

</div>

<div align="center">

English | [简体中文](./README.zh-CN.md)

</div>

## Introduction

stage are open source and aim at helping to develop, build and deploy various of applications quickly for individual developers or freelancer cli tools.
It built in many default templates which can resolve general requests and are improving and extending. what's more, it's supported by customized templates.

## Getting started

1. installation:

```sh
npm install -g @fujia/cli-core
```

## Features

- Initializing a project and launching it quickly by using a template, some common best practices are added in the template.
- Abundant default templates and customizable support.
- Initializing git repo automatically.
- Releasing a npm package simply and correctly.
- Efficiently build a docker image locally then push to container mirror repository and you own servers automatically.
- Easily deploy or update an application(service) based on docker swarm or PM2.
- Friendly to individual developers.

## Usage

<a id="help">🔗</a> view all commands and options：

```sh

stage -h

# Usage: stage <command> [options]
#
# Options:
#   -v, --version                 Print the version number
#   -d, --debug                   Enable debug model (default: false)
#   -lp, --localPath <localPath>  Specify the local debug file path (default: "")
#   -h, --help                    Show command help
#
# Commands:
#   init [options] [projectName]  Quickly initialize a universal project
#   publish [options]             Publish a project
#   release [options]             Release an npm package
#   docker [options]              To build a docker image and update  the corresponding service
#   service                       Deploy or update a service
#   clean [cacheFileName]         Clean the caches
#   help [command]                Show command help
```

### Environments Description

1. The command of "stage docker" and "stage service" are dependent on docker environment, make sure the related commands are run correctly, you need to configure the docker in local host and the server. How to install docker? please consult: https://docs.docker.com/get-docker/.

2. Running the command of "stage service", if you selected the PM2 to manage your services(applications), you have to configure node environment and install package of PM2 globally in the server. we recommend to manage node version by using NVM. How to install nvm? please consult: https://github.com/nvm-sh/nvm.

Instal PM2 globally:

```sh

npm install -g pm2

```

Go to the PM2 docs(https://pm2.keymetrics.io/docs/usage/quick-start/).

3. Before running any commands, stage will check the user home directory of the local host. If it doesn't exist, it will throw exceptions and terminate the process.

4. when some commands are executed, stage will create a directory which named ".stage-cli" in the user's home directory.

### Options

#### -v,--version：view stage version

Type the following command：

```sh
stage -v
# 1.3.6
```

#### -d, --debug：enable debug mode, by default：false

You can enable debug mode if you want to check the details of execution or development. When enabled, it will print the execution flows and key parameter information in the internal.

Take the clean command as an example：

```sh
stage -d clean

# [stage] verb [cli-exec]
# [stage] verb [cli-exec]     localPath: undefined,
# [stage] verb [cli-exec]     pkgName: @fujia/cli-clean,
# [stage] verb [cli-exec]     cmdName: clean
# [stage] verb [cli-exec]
# [stage] verb localPath /Users/sunny/.stage-cli/caches
# [stage] verb storeDir /Users/sunny/.stage-cli/caches/node_modules
# [stage] verb [cli-package]
# [stage] verb [cli-package]       localPath: /Users/sunny/.stage-cli/caches
# [stage] verb [cli-package]       pkgName: @fujia/cli-clean
# [stage] verb [cli-package]       pkgVersion: latest
# [stage] verb [cli-package]       storeDir: /Users/sunny/.stage-cli/caches/node_modules
# [stage] verb [cli-package]
# [stage] verb [cli-package]
# [stage] verb [cli-package] The version of the installing package is: 1.3.6
# [stage] verb [cli-package] Starting install @fujia/cli-clean...
# ...
```

#### -lp, --localPath <localPath>：specify local path of the command when in development or debug mode

In development or debug mode, you can add the parameter: --localPath <localPath>, then it will use local npm package to execute the corresponding command.

for example：

```sh
stage -d -lp [workDir]/stage/commands/cli-clean clean

# [stage] verb [cli-exec]
# [stage] verb [cli-exec]     localPath: undefined,
# [stage] verb [cli-exec]     pkgName: @fujia/cli-clean,
# [stage] verb [cli-exec]     cmdName: clean
# ...

```

#### -h, --help：views help information

seeing [above](#help).

### Commands

You can initialize, deploy and update an application(service) by series of commands.

#### init [options] [projectName]：to initialize a general project quickly

1. view init command:

```sh
stage help init

# Usage: stage init [options] [projectName]
#
# initializing an universal project quickly
#
# Options:
#   -f, --force  force to init project
#   -h, --help   display help for command
```

2. -f, --force, by default: false

when you passed this parameter, it'll force to initialize a project even if the work directory is not empty.

Note: this is a very **dangerous operation** of remove one folder. so "stage" will confirm again and check the removed folder name before remove.

3. projectName

- optional, if don't pass or invalid, you have to re-enter and "stage" will verify it. Note that the name follow the same rules as npm package name and strongly recommended don't use special characters.

4. select a template type, support the following:

- default: built in template, maintained by "stage" terms.
- custom: use your own templates

5. the available default templates, as follows:

> tips: most of templates are in the stage of development, we will improve them as soon as possible.

web:

- vue: base on [vue.js](https://github.com/vuejs/vue)
- vue-next: base on [vue-next](https://github.com/vuejs/vue-next)
- nuxtjs: base on nuxt.js
- vue-admin: base on [vue-element-admin](https://panjiachen.github.io/vue-element-admin-site/zh/guide/)
- react: base on react.js

app:

- react-native: base on React Native
- electron-rect: combine ui-puzzles@rect with Electron
- electron-antd: combine Antd with Electron

library:

- rollup: base on the Rollup
- webpack: base on the webpack

mini-program:

- wechat：wechat's mini program
- alipay：alipay's mini program

In the templates, we will add some common best practices, as: husky, Dockerfile and hot update of electron etc. of cause, you can remove them as your like. we hope that you can pay more attention to the business and ideas, producing the product of MVP1.0 quickly.

6. **we also provide a way to initial project which more simple, as follows:**

```sh
npm init stage@latest demos
```

That all, enjoy your works.

#### publish [options]：push your project to the github or gitee

> this functionality is not perfect and we are planing to refactor it.

1. views the command：

```sh

stage help publish

# Usage: stage publish [options]
#
# publish a project
#
# Options:
#   --refreshRepo   force to update the remote Git repository
#   --refreshToken  force to update the token of remote repository
#   --refreshOwner  force to update the type of remote repository
#   -h, --help      display help for command

```

2. options: --refreshRepo、--refreshToken、--refreshOwner

- --refreshRepo：force to update remote git repo
- --refreshToken：force to refresh remote git token
- --refreshOwner：force to update remote repository type(individual or organization)

3. input git repo token

running the command first, you need to enter Git token, and stage will store the token in .stage-cli folder.

How to set token?

- Github - seeing：https://github.com/settings/tokens
- Gitee - seeing：https://gitee.com/profile/personal_access_tokens

4. if the token is right, stage will finish the following operations automatically:

- initialize git and add default .gitignore file(Note: this .gitignore file only adjust to npm projects)
- add remote git url and create a main branch
- commit the initial template code to main branch, then check out the feature/0.1.0 branch

Note: stage will make some checks before running the command, as: check if the project is a valid npm project.

#### release [options]：publish a npm package easily

You only need to select a sematic version and publish it to npm registry quickly.

1. view the command:

```sh

stage help release

# Usage: stage release [options]
#
# release a npm package
#
# Options:
#   -a, --access <publishAccess>  set publish access is true (default: "public")
#   -h, --help                    display help for command

```

2. to ensure that the project is completely and correctly published to the npm, the following checks are done before publishing:

- check if is a npm project
- check for the existence of a files field in package.json or a .gitignore file in the project root, if they are not exist, stage will throw exceptions then end the process
- check the npm registry, if you have used the other registry mirror as: taobao, stage will force to switch to official registry by executing "npx nrm use npm"
- check if you are logged in to npm, if not, you'll be prompted to do so

3. at last, select a sematic version and start publishing.

that all, we published a npm package simply and correctly.

#### docker [options]：to build a docker image locally and push to container mirror repository

1. view the command:

```sh

stage help docker


# Usage: stage docker [options]
#
# to build a docker image and update corresponding service
#
# Options:
#   -b, --build                        build a docker image (default: false)
#   -u, --updateService [serviceName]  update a service
#   -h, --help                         display help for command

```

2. the options: -b, --build and -u, --updateService [serviceName]

- -b,--build：build a docker image locally and push to the container mirror repository if build successful, then stage will log in to the server by ssh and pull the latest built image
- -u, --updateService [serviceName]：it's optional, but if you set the parameter, stage will update the corresponding service when the remote server pull the latest image.

3. stage will check the following items before build:

- check docker environment. **Note: stage don't install the docker automatically and only prompt that**
  - check if exist Dockerfile file in the project root
  - check if exist .dockerignore file in the project root
- check the current branch name is "main" or "master", **Note: stage only you build a docker image in main or master branch**
- check the git stash of current project is empty

4. enter the server information, includes: username, port, ip.

the server information will store to the server-info.json file in the .stage-cli folder. the purpose of this is to void entering the same things repetitively. **Note: this information is sensitive, please keep it safe!**

5. enter the container mirror repo information, the details includes:

- owner: username
- userPwd: password
- repoZone: repo zone
- repoNamespace: namespace
- mirrorName: mirror name(repo name)
- mirrorVersion?: mirror version

we recommend to use the free container mirror service provide by aliyun or tencent.

#### service：deploy or update a service(application)

1. view the command:

```sh

stage help service

# Usage: stage service [options] [command]
#
# deploy or update a service
#
# Options:
#   -h, --help                    display help for command
#
# Commands:
#   deploy [stackName] [workDir]  deploy a service via docker image or PM2
#   update [serviceName]          update a service via docker image
#   help [command]                display help for command

```

2. deploy a service via docker swarm

> stage assumes you have configured docker swarm in the server. seeing here: https://docs.docker.com/engine/swarm/stack-deploy/.

use the following command:

```sh

docker service deploy stack-name

```

3. deploy or manage a service via PM2

> stage assumes you have installed the PM2 globally, seeing here: https://pm2.keymetrics.io/docs/usage/quick-start/.

```sh

docker service deploy

```

#### clean [cacheFileName]：clean up caches

You can clean up the cached npm packages manually.

1. view the command:

```sh

stage help clean

# Usage: stage clean [options] [cacheFileName]
#
# clean caches
#
# Options:
#   -h, --help  display help for command

```

2. examples:

```sh

stage clean


# ✔ Installed 1 packages
# ✔ Linked 34 latest versions
# ✔ Run 0 scripts
# ✔ All packages installed (34 packages installed from npm registry, used 5s(network 5s), speed 299.45KB/# s, json 34(1.57MB), tarball 0B)
# [stage] info starting to clean cached directories: /Users/sunny/.stage-cli/caches, /Users/sunny/.# stage-cli/templates
# [stage] info process exited!

```

#### help [command]：view the usage of one command.

## Examples

we have provided a complete example to demonstrate how to create a web application so that you can quickly understand the entire process. [go to](./examples/README.md).

## Questions

stage is available now, but still under rapid development, so there are many problems, please believe that we will actively work on them!

### Testing

unit tests, to ensure the high availability, stability and maintainability of the application, we must ensure sufficient unit testing.

## Plans

### Template Ecological Construction

1. to refine the default templates.

2. to determine the development direction of custom templates.

### More useful features

1. support chinese.

2. commands plugged in, which is the focus of the next big release.

3. cloud build.

### Combining the power of third-party developers

this is the focus and direction of the future development of the stage.

## Supporting Stage

if the project is helpful to you, please click a star on [github](https://github.com/fujia-cli/stage), thanks so much.

## References

1. Gitee OpenAPI - https://gitee.com/api/v5/swagger#/getV5ReposOwnerRepoStargazers?ex=no.

2. docker docs - https://docs.docker.com/get-docker/.

3. nvm - https://github.com/nvm-sh/nvm.

4. pm2 - https://pm2.keymetrics.io/docs/usage/quick-start/.

5. vue-element-admin - (https://panjiachen.github.io/vue-element-admin-site/zh/guide/).

6. Container mirror service of aliyun(ACR) - https://help.aliyun.com/document_detail/257112.html

7. Container mirror service of tencent - https://cloud.tencent.com/document/product/1141.

8. node.js - https://nodejs.org/en/docs/.

9. npm docs - https://docs.npmjs.com/.

10. imooc-cli - https://github.com/imooc-lego/imooc-cli.
