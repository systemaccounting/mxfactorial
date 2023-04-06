#!/bin/bash

go mod download
cargo install cross --git https://github.com/cross-rs/cross
cargo install cargo-watch
source ./scripts/rebuild-client-image.sh
make compose-up
gh codespace ports visibility 8080:public -c "$CODESPACE_NAME"