#!/bin/bash

BUILD_TARGET=$1

build_deps() {
  # rm -f clone-layer.zip
  # yarn install
  # mkdir nodejs
  # cp -r node_modules nodejs/node_modules
  # zip -r clone-layer.zip nodejs
  # rm -rf nodejs
  echo 'clone-faas has 0 deps. not building layer'
}

build_src() {
  rm -f clone-src.zip
  # yarn install
  zip -r clone-src.zip index.js
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