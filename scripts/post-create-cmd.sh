#!/bin/bash

# used as postCreateCommand in .devcontainer.json

go mod download

# https://github.com/evanw/esbuild/issues/1819#issuecomment-1018771557
rm -rf client/node_modules

if [[ $CODESPACES ]]; then
	source ./scripts/rebuild-client-image.sh
fi

make compose-up

if [[ $CODESPACES ]]; then
	gh codespace ports visibility 8080:public -c "$CODESPACE_NAME"
fi