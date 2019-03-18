#!/bin/bash

BUILD_TARGET=$1

build_deps() {
  rm -f graphql-layer.zip
  yarn install
  mkdir nodejs
  cp -r node_modules nodejs/node_modules
  zip -r graphql-layer.zip nodejs
  rm -rf nodejs
}

build_src() {
  rm -f graphql-src.zip
  yarn install
  zip -r graphql-src.zip index.js src package.json yarn.lock
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