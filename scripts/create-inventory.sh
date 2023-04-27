#!/bin/bash

yq '.. | select(has("type") and .type == "app" and has("deploy") and .deploy == true) | path | join("/")' project.yaml | sort -r > inventory