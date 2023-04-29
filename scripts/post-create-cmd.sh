#!/bin/bash

# used as postCreateCommand in .devcontainer.json

go mod download
cargo install cross --git https://github.com/cross-rs/cross
cargo install cargo-watch
if [[ $CODESPACES ]]; then
	source ./scripts/rebuild-client-image.sh
fi
make compose-up
if [[ $CODESPACES ]]; then
	gh codespace ports visibility 8080:public -c "$CODESPACE_NAME"
fi