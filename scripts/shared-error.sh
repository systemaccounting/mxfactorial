#!/bin/bash

function error_exit() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }