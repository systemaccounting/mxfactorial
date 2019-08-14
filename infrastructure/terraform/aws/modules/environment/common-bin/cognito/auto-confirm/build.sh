#!/bin/bash

build_src() {
  rm -f auto-confirm-src.zip
  zip -r auto-confirm-src.zip index.js
}

build_src