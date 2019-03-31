#!/bin/bash

BUILD_TARGET=$1

build_deps() {
  rm -f git-layer.zip
  yarn install
  mkdir nodejs
  cp -r node_modules nodejs/node_modules
  zip -r git-layer.zip nodejs
  rm -rf nodejs
}

build_src() {
  rm -f git-src.zip
  yarn install
  zip -r git-src.zip index.js diffs package.json yarn.lock
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