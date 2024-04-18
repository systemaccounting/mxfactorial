#!/bin/bash

# used as postCreateCommand in .devcontainer.json

rustup component add llvm-tools-preview --toolchain stable-x86_64-unknown-linux-gnu

make --no-print-directory start