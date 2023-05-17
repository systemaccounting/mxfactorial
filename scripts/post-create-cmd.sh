#!/bin/bash

# used as postCreateCommand in .devcontainer.json

go mod download

make --no-print-directory start