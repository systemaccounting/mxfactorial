#!/bin/bash

PROJECT_CONF=project.yaml

yq '.. | select(has("set")) | select(.set != null) | .set | keys | .[]' $PROJECT_CONF | sort