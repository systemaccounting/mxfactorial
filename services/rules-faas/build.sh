#!/bin/bash
set -e

BUILD_TARGET=$1

build_deps() {
  rm -f rules-layer.zip
  yarn install
  mkdir nodejs
  cp -r node_modules nodejs/node_modules
  zip -r rules-layer.zip nodejs
  rm -rf nodejs
}

build_src() {
  rm -f rules-src.zip
  yarn install
  yarn test && zip -r rules-src.zip index.js src package.json yarn.lock jest.config.js
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