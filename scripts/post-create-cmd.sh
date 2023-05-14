#!/bin/bash

# used as postCreateCommand in .devcontainer.json

go mod download

# https://github.com/evanw/esbuild/issues/1819#issuecomment-1018771557
rm -rf client/node_modules

make --no-print-directory dev