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

- 使用模板快速初始化一个项目并启动，模板中内置了一些通用的最佳实践。
- 丰富的默认模板且支持定制，默认模板包括：web 项目(当前支持：vue 和 react 框架)，h5, 小程序(当前支持：支付宝和微信)，React Native，Electron 以及 library 等。
- 快速初始化 git 环境，并将模板代码推送到 Git 仓库。
- 轻松且正确地发布一个 npm 项目。
- 高效地在本地构建一个 docker image 并推送到容器镜像仓库和服务器上。
- 基于 docker swarm 或 PM2 部署和更新一个应用(服务)。
- 对独立开发者友好。

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

1，stage docker 和 stage service 命令依赖 docker 环境，为了保证相关命令的正确执行，请自行在本地主机和服务器上配置好 docker。如何安装 docker？请参考：https://docs.docker.com/get-docker/。

2，在 stage service 中如果使用 PM2 方式管理服务(应用)，需要确保服务器上配置好了 node 环境，请全局安装了 pm2。我们建议使用 nvm 来管理 node，如何安装 nvm? 请参考：https://github.com/nvm-sh/nvm

全局安装 pm2：

```sh

npm install -g pm2

```

pm2 使用文档，请参考：https://pm2.keymetrics.io/docs/usage/quick-start/。

3，本地主机用户主目录。我们会在命令执行之前，检查用户主目录，如果不存在，将抛出异常，结束执行进程。

4，执行 stage 一些命令时，会在用户主目录下创建.stage-cli 应用目录，并将一些信息缓存在该目录下。**注意：有些信息可能是敏感的，请妥善保管。**

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

示例见[上文](#help)。

### 命令

通过一系列的命令，快速初始化，部署，更新一个应用或服务。

#### init [options] [projectName]：快速初始化一个通用的项目

1，查看 init 命令：

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

3，可选参数 projectName：项目名称，即 package.json 中的 name 属性值。

- 该参数是可选的，如果在 init 命令中没有传入或传入的名称不合法，会在后面要求你再次输入。什么是合法的 projectName？简单来说是以字母开头，可以使用下划线"\_"、连接符"-"以及数字，强烈建议不要使用特殊字符，否则导致对项目名称的校验会通不过。同时，也支持 scope 命名方式。

4，选择模板类型，支持如下：

- default：模板支持的模板类型，我们会进行维护。
- custom：支持定制你自己的模板。
- remote(计划中)：将模板保存在自建的服务端，结合浏览器可以更加高效的管理模板，推荐需要管理的模板较多或对模板要高定制的要求时采用。

5，在执行过程中，需要你选择项目模板，目前可用模板如下：

> 当前大部分的处于开发中，我们尽快完善整个模板生态。

web:

- vue: 基于 vue.js@2 的二次封装。
- vue-next: 基于 vue.js@2 的二次封装。
- nuxtjs: 基于 nuxt.js 的二次封装。
- vue-admin: 基于[vue-element-admin](https://panjiachen.github.io/vue-element-admin-site/zh/guide/)的二次封装，仅保留了基本结构，进一步完善应用的细节。
- react: 基于 rect.js 的二次封装。

app:

- react-native: 基于 React Native 开发的原生 App。
- electron-rect: 结合 ui-puzzles@rect 和 Electron 开发的桌面应用。
- electron-antd: 结合 Antd 和 Electron 开发的桌面应用。

library:

- rollup: 基于 Rollup 打包工具快速开发一个库
- webpack: 基于 webpack 打包工具快速开发一个库

mini-program:

- wechat：微信小程序模板。
- alipay：支付宝小程序模板。

在模板开发中，我们将一些通用的最佳实践融入模板，如：husky，Dockerfile 以及 Electron 热更新等等，用一种合适的方式提供基础配置，当然你可以按照需要进行修改，从而，希望你可以将更多的精力投注到业务开发以及更好的创意上，快速开发出产品的 MVP1.0 版本。同时，对于经验不足的同学，也会更友好。

#### publish [options]：将初始化的项目推送到 github 或 gitee 上

> tips: 该功能目前可用，但并不完善，我们计划将它与其它的功能结合(如：云构建)，产生更多的玩法。
> tips: 关于云构建，好处是我们可以进一步的规范、甚至定制整个构建流程，但对于个人开发者来说并不友好，意味着我们可能需要额外的服务器，这与我们的初衷有些相悖，目前在计划如何将「云构建」部署在本地或局域网内一台通用的电脑上(ps: 使用树莓派搭建来是个很好地注意，也很酷。当然，前提是你得先拥有它)。

1，查看命令：

```sh

stage help publish

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
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

2，配置项[options]: --refreshRepo、--refreshToken、--refreshOwner

- --refreshRepo：强制更新远程 Git 仓库。
- --refreshToken：强制刷新远程仓库的 token。
- --refreshOwner：强制更新远程仓库的类型(个人或组织)。

3，输入 Git 仓库的 token

首次使用该命令时，需要你输入 Git token，我们会将 token 保存在本地用户目录下的.stage-cli 目录下。

去哪里设置并获得 token？

- Github - 参考：https://github.com/settings/tokens。
- Gitee - 参考：https://gitee.com/profile/personal_access_tokens。

4，如果 token 正确，选择仓库类型后，stage 会完成下面的操作：

- 初始化 git, 生成.git 和默认的.gitignore(注意：该.gitignore 仅适应 npm 项目)。
- 设置远程仓库地址，添加 main 分支。
- 将初始化代码提交到远程仓库 main 分支上，并切换到开发分支 feature/0.1.0 版本。

需要注意的是，stage 会一些校验，如是否是一个合法的 npm 项目等。

#### release [options]：快速发布一个 npm 包

选择一个语义化版本，快速地将项目发布到 npm 上。

1，查看命令：

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

2，发布前会做下面校验，保证项目正确完整的发布到 npm：

- 检查是否是一个 npm 项目。
- 检查在 package.json 中是否存在 files 字段或项目根目录下存在.gitignore 文件，如果两者都不存在，抛出异常，退出执行进程。
- 检查当前是否在 main 或 master 分支，**请注意：我们只允许你在 main 或 master 分支上发布 npm**。
- 检查当前项目的 git stash 是否为空，确保没有未提交的改动。
- 检查 npm registry，如果使用 registry 镜像，如：taobao，stage 会执行"npx nrm use npm"将 registry 切换到官方 registry。
- 检查是否登录 npm，如果没有登录，会提示你进行登录操作。

3，如上的校验通过后，选择一个要发布的语义化版本，开始发布。

就这样，我们轻松愉快且正确的发布了一个 npm 项目。

#### docker [options]：在本地构建一个 docker image 并推送到容器镜像仓库(推荐使用：阿里云或腾讯云的容器镜像仓库的个人版)，同时更新对应的服务

1，查看命令：

```sh

stage help release

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

2，配置项：-b, --build 和 -u, --updateService [serviceName]

- -b,--build：本地构建一个 docker image，成功后推送到容器镜像服务仓库，推送成功后，会登录服务器拉取最新构建的 image。
- -u, --updateService [serviceName]：项目镜像构建并推动到容器镜像服务成功后，开始更新 serviceName 服务；serviceName 是可选的，如果没有填写，需要你输入或选择。

3，构建前校验：

- 检查 docker 环境，**注意：stage 不会自动配置 docker 环境，只会给出相应的提示！！！**，如果本地主机以及服务器上没有配置 docker 环境或配置不正确，会导致构建失败。
  - 检查是否存在 Dockerfile 文件。
  - 检查是否存在.dockerignore 文件。
- 检查用户主目录下.stage-cli 的命令目录。
- 检查当前是否在 main 或 master 分支，**请注意：我们只允许你在 main 或 master 分支上构建 docker image**。
- 检查当前项目的 git stash 是否为空，确保没有未提交的改动。

4，输入服务器信息，包括：用户名，端口，IP 地址

服务器信息会缓存在.stage-cli 目录下的 server-info.json 文件中，这样可以避免重复输入操作。**注意：这些信息属于敏感信息，请妥善保管！**。

5，输入容器镜像仓库信息

仓库信息包含如下:

- owner: 用户名
- userPwd: 用户密码
- repoZone: 仓库地域
- repoNamespace: 命名空间
- mirrorName: 镜像名称(仓库名称)
- mirrorVersion?: 镜像版本号

我们推荐使用阿里云的容器镜像服务(ACR) - [文档地址](https://help.aliyun.com/document_detail/257112.html?spm=5176.21213303.1362911.4.592a3edaca90z8&scm=20140722.S_card@@%E5%8D%A1%E7%89%87@@652._.ID_card@@%E5%8D%A1%E7%89%87@@652-RL_%E5%AE%B9%E5%99%A8%E9%95%9C%E5%83%8F%E6%9C%8D%E5%8A%A1-OR_ser-V_2-P0_0)，或腾讯云的容器镜像服务 - [文档地址](https://cloud.tencent.com/document/product/1141)。

它们提供的服务的个人版，基本可以满足个人的日常开发，最重要的是，它们目前是免费的，这对个人开发者来说，很友好！

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

> 假设你已经在服务器上配置好了 docker swarm 环境，可以参考：https://docs.docker.com/engine/swarm/stack-deploy/。

执行下面命令：

```sh

docker service deploy stack-name

```

选择部署服务类型为：local+docker， 注意：[stackName], [workDir]是可选的，stackName 如果没有提供的话，之后需要输入；workDir 默认是`$HOME/${username}/apps/docker/${stackName}`。

执行命令之前会检查：

- 当前项目根目录下是否存在 stack.yml 文件。stack.yml 配置可以参考：https://docs.docker.com/compose/compose-file/compose-file-v3/。

**该命令会将当前目录的文件通过 scp 命令复制到对应的文件夹，在服务器上执行：`docker stack deploy -c stack.yml ${stackName}`**。

3，使用 PM2 部署管理一个服务

> 假设你已经在服务器上安装了 pm2，可以参考：https://pm2.keymetrics.io/docs/usage/quick-start/。

执行下面命令：

```sh

docker service deploy

```

选择部署服务类型为：pm2， 注意：[workDir]是可选的，workDir 默认是`"$HOME/apps/pm2`。

执行命令之前会检查：

- 当前项目根目录下是否存在 ecosystem.config.js 文件。ecosystem.config.js 编写可以参考：https://pm2.keymetrics.io/docs/usage/application-declaration/。

**该命令会将当前目录的文件通过 scp 命令复制到对应的文件夹，在服务器上使用 pm2 部署**。

#### component：为 ui-puzzles 组件库快速创建一个组件，注意：该命令是一个针对 ui-puzzles 的专用命令，已被隐藏

> [计划]：为了明确 stage 的职责边界，我们计划之后会将该命令移除出去，抽离成一个单独的 cli。

1，查看命令：

```sh

stage help component

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# Usage: stage component [options] <componentName> [destination]
#
# create a component template for ui-puzzles UI library
#
# Options:
#   -t, --template <templateType>  select a component template
#   -h, --help                     display help for command

```

2，使用：

```sh

stage component -t react tag /src/component

```

在[@ui-puzzles/rect](https://www.npmjs.com/package/@ui-puzzles/rect)项目根目录下执行该命令，会在当前目录下的/src/components 目录下创建一个 Tag 目录，它是一个名为 Tag 组件模板。

> 注意：目前还只支持创建 react 组件模板。

#### clean [cacheFileName]：清除缓存

如果用户电脑磁盘存储紧张的情况下，可以手动清除 stage 创建的缓存(如：node_modules 目录)。

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

我们提供了创建一个完整的 web 应用示例，以便于你快速了解整个流程。[请前往](./examples/README.md)。

## 问题

stage 目前是可用的，但仍处于快速开发中，所以存在着很多的问题，当然，请相信我们会积极的解决它们！这些问题可以大致分为下面几种类型。

### 测试

1，单元测试，为了进一步确保应用的高可用性，稳定性以及可维护性等，我们必须保证足够的单元测试。

### 生态

1，模板生态

默认模板 - 默认模板我们会积极维护，尽可能的做到开箱即用。我们期望的是将一些通用的页面，如登录页，消息页等维护进去，避免你重复的编写这些内容或提供参考；或内嵌一些通用的功能，如：第三方登录，消息推送，机器人等。

自定义模板 - 我们希望有一个单独的网站来管理这些模板(项目)，这样我们就可以有更丰富的选择，非常高效的去创建一个应用来解决某一类业务。同时，如果可以的话，支持模板交易，从而激励更多的开发者发布或创建一个模板。**然而，当前我们并没有信心把它做好，只能暂时搁浅。**

2，插件生态

当 stage 逐渐成熟稳定之后，我们会进一步的明确它的职责边界，探索它的下一步发展和更多可能的玩法。下一步，一个重大的计划是，会在下一个大版本重构整个 stage 的结构，stage 只关注核心的逻辑，**将所有的命令及其他功能插件化**。

我们确信这是一个更好的方向，逐步提高 stage 的可扩展性，又可以避免架构的臃肿，同时保证了功能的单一性，且更加有利于后期维护。

### 功能

1，stage 被创建的初衷是为了解决作为个人开发者(独立开发者)或经验不足的同学在开发应用时遇到的诸多问题，如：更高层次的复用(ps: 项目级别，快速解决某一类业务，不需要从零开始开发)、项目配置、部署等一系列的问题，所以功能很难避免单一且无法具有更高的通用性。

2，技术能力和应用场景的限制导致我们无法保证功能的高可用性，而哪些「最佳实践」未必就已经是**最佳**。我们只能在当前已有的技术水准做到最好，去找到更多的应用场景，持续地迭代优化。

3，由于是面向独立开发者服务的，在技术选型上，我们会尽可能的选择一些免费的方案，这可能会带来一些问题，如：安全，服务使用限制等。

### 性能

1，测试过程中发现网络不好的情况下，npm 包安装会失败，需要进一步优化。

2，进一步规范化缓存策略。

3，减少有些命令的执行时长，如：stage docker 命令。

### 规范

1，信息提示规范，做好细节优化，保证不同平台下的一致性，尽可能的兼容通用的终端。

2，代码规范。

## 计划

### 模板生态建设

1，我们会在当前大版本下尽可以的完善默认的模板。

2，我们会在当前大版本确定自定义模板的发展方向。

### 更多通用功能扩展

1，支持中文。

2，命令与一些功能插件化，这是下一个大版本的重点。

3，云构建。

### 结合第三方开发者力量

1，这是 stage 未来发展的重点，需要我们不间断的努力和引导。但目前来说，仍有些距离，我们正处于探索阶段。

## 支持

1，如果项目对你对你有帮助，请在[github](https://github.com/fujia-cli/stage)点个 star。

## 参考资料

1，Gitee OpenAPI - https://gitee.com/api/v5/swagger#/getV5ReposOwnerRepoStargazers?ex=no 。

2，docker docs - https://docs.docker.com/get-docker/ 。

3，nvm - https://github.com/nvm-sh/nvm 。

4，pm2 - https://pm2.keymetrics.io/docs/usage/quick-start/ 。

5，vue-element-admin - (https://panjiachen.github.io/vue-element-admin-site/zh/guide/) 。

6，阿里云的容器镜像服务(ACR) - https://help.aliyun.com/document_detail/257112.html?spm=5176.21213303.1362911.4.592a3edaca90z8&scm=20140722.S_card@@%E5%8D%A1%E7%89%87@@652._.ID_card@@%E5%8D%A1%E7%89%87@@652-RL_%E5%AE%B9%E5%99%A8%E9%95%9C%E5%83%8F%E6%9C%8D%E5%8A%A1-OR_ser-V_2-P0_0 。

7，腾讯云的容器镜像服务 - https://cloud.tencent.com/document/product/1141 。

8，node.js - https://nodejs.org/en/docs/ 。

9，npm docs - https://docs.npmjs.com/ 。

10，imooc-cli - https://github.com/imooc-lego/imooc-cli 。
