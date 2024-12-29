#!/bin/bash

set -e

# require manual install of docker
if ! command docker -v >/dev/null 2>&1; then
	echo -e "\033[1;33minstall docker from https://docs.docker.com/desktop/install/mac-install/ before continuing\033[0m"
	exit 1
fi

# brew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# node
brew install node

# awscli
brew install awscli

# tfswitch
brew install warrensbox/tap/tfswitch

# libpq
brew install libpq
brew link --force libpq

# golang-migrate
brew install golang-migrate

# yq
brew install yq

# eslint
npm install -g eslint

# rust
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y

# llvm-tools-preview
rustup component add llvm-tools-preview --toolchain stable-x86_64-apple-darwin

# cargo-watch
cargo install cargo-watch

# cargo--llvm-cov
cargo install cargo-llvm-cov

# ytt
brew tap carvel-dev/carvel
brew install ytt

# cue
brew install cue-lang/tap/cue