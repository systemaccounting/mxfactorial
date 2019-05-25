#!/bin/bash

build_src() {
  rm -f delete-faker-src.zip
  zip -r delete-faker-src.zip index.js
}

build_src