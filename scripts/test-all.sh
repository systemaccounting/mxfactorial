#!/bin/bash

set -e

PROJECT_CONF=project.yaml

# standard lint
cargo fmt --all -- --check
# clippy lint
cargo clippy --all-targets --all-features -- -D warnings
# unit test
cargo test
# test db
make --no-print-directory -C crates/pg test-db
# test cache
make --no-print-directory -C crates/redisclient test-cache
# test integration
make --no-print-directory -C tests test-local
# test client
make --no-print-directory -C client test

echo ''
echo "*** removing $PROJECT_CONF development settings"
if [[ $(uname -s) == "Darwin" ]]; then
	sed -i '' 's/rust_log:.*/rust_log: off/' $PROJECT_CONF
else
	sed -i 's/rust_log:.*/rust_log: off/' $PROJECT_CONF
fi
# use yq to set .client.env_var.set.GOOGLE_MAPS_API_KEY.default to null
yq -i '.client.env_var.set.GOOGLE_MAPS_API_KEY.default = null' $PROJECT_CONF
# remove empty line at end of project.yaml
printf %s "$(cat $PROJECT_CONF)" >$PROJECT_CONF
# test project.yaml types
cue vet ./cue/project_conf.cue $PROJECT_CONF