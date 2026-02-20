#!/bin/bash

yq '.. | select(has("type") and .type == "app" and has("deploy_target") and .deploy_target != null) | path | join("/")' project.yaml | sort -r > inventory