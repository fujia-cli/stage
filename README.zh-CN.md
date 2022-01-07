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

stage 是一款开源的，旨在协助个人开发者或自由职业者快速开发、构建以及部署各类应用的脚手架工具。它内置了大量的默认模板，基本覆盖了当前常见的应用类型，而且还在不断扩展中，最重要的是，支持可定制。
选择一款你想要创建的应用类型模板，下载并启动它。模板中内置了一些应用通用的关于开发，构建以及部署的最佳实践，开发者可以根据需要决定是否采用它们。我们的初衷是希望能帮助开发者将更多的精力放在应用的创意上，快速构建应用的 MVP1.0 版本。

# 安装

1，使用下面命令安装

```sh

npm install -g @fujia/core-cli

# 或使用yarn
yarn global add @fujia/core-cli
```

# 功能

- 使用模板快速初始化一个项目并启动，模板中内置了一些通用的最佳实践.
- 支持定制和丰富的内置模板，包括：web 项目(当前支持：vue 和 react 框架)，h5, 小程序(当前支持：支付宝和微信)，React Native，Electron 以及 library
-

# 使用

使用下面命令查看所有命令和配置项

```sh
# 查看帮助信息
stage -h

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

## 配置项

### -v,--version：查看脚手架当前版本

输入下面命令：

```sh
stage -v

# [stage] info Thanks to use @fujia/stage(version: 1.1.5)🏖
# 1.1.5
```

### -d, --debug：启动调试模式，默认：false

在开发的过程中或

## 命令

# 问题

# 计划

# 支持

1，如果项目对你对你有帮助，请在[github](https://github.com/fujia-cli/stage)点个 star
