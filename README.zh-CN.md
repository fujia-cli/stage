<div align="center">
  <a href="https://github.com/fujia-cli/stage" target="_blank">
    <img alt="stage logo" width="200" src="https://github.com/fujia-blogs/articles/blob/main/stage-ci/assets/stage.svg"/>
  </a>
</div>

<div align="center">
  <h1>@fujia/stage</h1>
</div>

<div align="center">

一套使应用开发和部署更加简单的脚手架工具。

</div>

<div align="center">

[English](./README.md) | 简体中文

</div>

# 介绍

stage 是一款开源的，旨在协助个人开发者或自由职业者快速开发、构建以及部署各类应用的脚手架工具。它内置了大量的默认模板，基本覆盖了当前常见的应用类型，而且还在不断扩展中，当然，支持可定制。
选择一款你想要创建的应用类型模板，下载并启动它。模板中内置了一些应用开发，构建以及部署通用的最佳实践，开发者可以根据需要决定是否采用它们。我们的初衷是希望能帮助开发者将更多的精力放在应用的创意上，快速构建应用的 MVP1.0 版本。

# 安装

1，使用下面命令安装

```sh

npm install -g @fujia/core-cli

# 或使用yarn
yarn global add @fujia/core-cli
```

## 功能

- 使用模板快速初始化一个项目并启动，模板中内置了一些通用的最佳实践.
- 支持定制和丰富的内置模板，包括：web 项目(当前支持：vue 和 react 框架)，h5, 小程序(当前支持：支付宝和微信)，React Native，Electron 以及 library
-

## 使用

<a id="help">🔗</a> 使用下面命令查看所有命令和配置项：

```sh

stage

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# Usage: stage <command> [options]
#
# Options:
#   -v, --version                 output the version number
#   -d, --debug                   enable debug model (default: false)
#   -lp, --localPath <localPath>  specify the local debug file path (default: "")
#   -h, --help                    display help for command
#
# Commands:
#   init [options] [projectName]  initializing an universal project quickly
#   publish [options]             publish a project
#   release [options]             release a npm package
#   docker [options]              to build a docker image and update corresponding service
#   service                       deploy or update a service
#   clean [cacheFileName]         clean caches
#   help [command]                display help for command
```

### 环境说明

### 配置项

#### -v,--version：查看脚手架当前版本

输入下面命令：

```sh
stage -v

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# 1.1.5
```

#### -d, --debug：启动调试模式，默认：false

在开发的过程中调试 bug 或想要查看执行时的详细信息，可以启用该模式。启用后，在终端执行命令，会打印出命令的执行流程以及关键的参数信息。

以 clean 命令为例：

```sh
stage -d clean

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
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
# [stage] verb [cli-package] The version of installing package is: 1.1.5
# [stage] verb [cli-package] Starting install @fujia/cli-clean...
# ...
```

#### -lp, --localPath <localPath>：在开发过程中进行调试时，指定一条命令对应的本地 npm 包的文件夹路径

在开发过程中调试命令时，可以通过添加参数：--localPath <localPath>，来指定使用本地 npm 包，从而简化调试，避免重复的构建和发布操作。同时可以启动 debug 模式，快速定位到问题。

示例如下：

```sh
stage -d -lp [文件路径]/stage/commands/cli-clean clean

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# [stage] verb [cli-exec]
# [stage] verb [cli-exec]     localPath: undefined,
# [stage] verb [cli-exec]     pkgName: @fujia/cli-clean,
# [stage] verb [cli-exec]     cmdName: clean
# ...

```

#### -h, --help：快速查看帮助信息

示例见[上文](#help)

### 命令

通过一系列的命令，快速初始化，部署，更新一个应用或服务。

#### init [options] [projectName]：快速初始化一个通用的项目

1，查看 init 命令

```sh
stage help init

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# Usage: stage init [options] [projectName]
#
# initializing an universal project quickly
#
# Options:
#   -f, --force  force to init project
#   -h, --help   display help for command
```

2，options: -f, --force，默认：false

执行命令时，传入-f 或--force，如果当前工作目录不为空，会清空当前目录，强制 init 一个项目。

注意：清空目录时，会进行二次确认，这是因为删除文件是一个非常危险的操作，同时会对删除目录校验。

3，可选参数 projectName：项目名称，即 package.json 中的 name 属性值

- 该参数是可选的，如果在 init 命令中没有传入或传入的名称不合法，会在后面要求你再次输入。什么是合法的 projectName？简单来说是以字母开头，可以使用下划线"\_"、连接符"-"以及数字，强烈建议不要使用特殊字符，否则导致对项目名称的校验会通不过。同时，也支持 scope 命名方式。

4，选择模板类型，支持如下：

- default：模板支持的模板类型，我们会进行维护
- custom：支持定制你自己的模板
- remote(计划中)：将模板保存在自建的服务端，结合浏览器可以更加高效的管理模板，推荐需要管理的模板较多或对模板要高定制的要求时采用

5，在执行过程中，需要你选择项目模板，目前可用模板如下：

> 当前大部分的处于开发中，我们尽快完善整个模板生态

#### publish [options]：将初始化的项目推送到 github 或 gitee 上

#### release [options]：快速发布一个 npm 包

#### docker [options]：在本地构建一个 docker image 并推送到容器镜像仓库(推荐使用：阿里云或腾讯云的容器镜像仓库的个人版)，同时更新对应的服务

1，

#### service：部署或更新一个服务(应用)

1，查看 service 命令：

```sh

stage help service

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
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

2，使用 docker swarm 部署一个服务

> 假设你已经在服务器上配置好了 docker swarm 环境，可以参考：https://docs.docker.com/engine/swarm/stack-deploy/

执行下面命令：

```sh

docker service deploy stack-name

```

选择部署服务类型为：local+docker， 注意：[stackName], [workDir]是可选的，stackName 如果没有提供的话，之后需要输入；workDir 默认是`$HOME/${username}/apps/docker/${stackName}`。

执行命令之前会检查：

- 当前项目根目录下是否存在 stack.yml 文件。stack.yml 配置可以参考：https://docs.docker.com/compose/compose-file/compose-file-v3/

**该命令会将当前目录的文件通过 scp 命令复制到对应的文件夹，在服务器上执行：`docker stack deploy -c stack.yml ${stackName}`**

3，使用 PM2 部署管理一个服务

> 假设你已经在服务器上安装了 pm2，可以参考：https://pm2.keymetrics.io/docs/usage/quick-start/

执行下面命令：

```sh

docker service deploy

```

选择部署服务类型为：pm2， 注意：[workDir]是可选的，workDir 默认是`"$HOME/apps/pm2`。

执行命令之前会检查：

- 当前项目根目录下是否存在 ecosystem.config.js 文件。ecosystem.config.js 编写可以参考：https://pm2.keymetrics.io/docs/usage/application-declaration/

**该命令会将当前目录的文件通过 scp 命令复制到对应的文件夹，在服务器上使用 pm2 部署**

#### clean [cacheFileName]：清除缓存

如果用户电脑磁盘存储紧张的情况下，可以手动清除 stage 创建的缓存(如：node_modules 目录)

查看 clean 命令：

```sh

stage help clean

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# Usage: stage clean [options] [cacheFileName]
#
# clean caches
#
# Options:
#   -h, --help  display help for command

```

示例：

```sh

stage clean

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# ✔ Installed 1 packages
# ✔ Linked 34 latest versions
# ✔ Run 0 scripts
# ✔ All packages installed (34 packages installed from npm registry, used 5s(network 5s), speed 299.45KB/# s, json 34(1.57MB), tarball 0B)
# [stage] info starting to clean cached directories: /Users/sunny/.stage-cli/caches, /Users/sunny/.# stage-cli/templates
# [stage] info process exited!

```

#### help [command]：查看命令的使用

查看一条命令的使用，包括如：options, subcommands 等，以 docker 为例，如下：

```sh

stage help docker

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# Usage: stage docker [options]
#
# to build a docker image and update corresponding service
#
# Options:
#   -b, --build                        build a docker image (default: false)
#   -u, --updateService [serviceName]  update a service
#   -h, --help                         display help for command

```

## 示例

## 问题

### 生态

### 功能

### 性能

### 规范

## 计划

### 模板生态建设

### 更多通用功能扩展

### 融合第三方开发者力量

## 支持

1，如果项目对你对你有帮助，请在[github](https://github.com/fujia-cli/stage)点个 star

## 参考

1，
