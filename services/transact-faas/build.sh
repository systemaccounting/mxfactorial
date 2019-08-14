#!/bin/bash
set -e
BUILD_TARGET=$1

build_deps() {
  rm -f transact-layer.zip
  yarn install
  mkdir nodejs
  cp -r node_modules nodejs/node_modules
  zip -r transact-layer.zip nodejs
  rm -rf nodejs
}

build_src() {
  rm -f transact-src.zip
  yarn install
  yarn test && zip -r transact-src.zip index.js src package.json yarn.lock jest.config.js
}

archive() {
  case $1 in
    "all")
      build_deps
      build_src
      ;;
    "deps")
      build_deps
      ;;
    *)
      build_src
      ;;
  esac
}

archive $BUILD_TARGET