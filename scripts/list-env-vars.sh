#!/bin/bash

PROJECT_CONF=project.yaml

yq '.. | select(has("set")) | .set | keys | .[]' $PROJECT_CONF | sort