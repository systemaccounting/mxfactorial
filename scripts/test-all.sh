#!/bin/bash

set -e

PROJECT_CONF=project.yaml

# standard lint
cargo fmt --all -- --check
# clippy lint
cargo clippy --all-targets --all-features -- -D warnings
# unit test
cargo test
# test cache
make --no-print-directory -C crates/cache test-cache
# test db
make --no-print-directory -C crates/pg test-db
# test integration
make --no-print-directory -C tests test-local
# test client
make --no-print-directory -C client test
# restore db to initial state after e2e tests
bash scripts/test-reset.sh
# test project.yaml types
cue vet ./cue/project_conf.cue $PROJECT_CONF

echo ''
echo "*** removing $PROJECT_CONF development settings"
if [[ $(uname -s) == "Darwin" ]]; then
	sed -i '' 's/rust_log:.*/rust_log: off/' $PROJECT_CONF
else
	sed -i 's/rust_log:.*/rust_log: off/' $PROJECT_CONF
fi
# use yq to set .client.env_var.set.GOOGLE_MAPS_API_KEY.default to null
yq -i '.client.env_var.set.GOOGLE_MAPS_API_KEY.default = null' $PROJECT_CONF
# reverse .github/workflows/warm-cache.yaml:57 if run locally
yq -i '.migrations.warm-cache.env_var.get -= ["CACHE_KEY_RULES", "CACHE_KEY_STATE", "CACHE_KEY_ACCOUNT", "CACHE_KEY_APPROVAL", "CACHE_KEY_PROFILE", "CACHE_KEY_PROFILE_ID", "CACHE_KEY_APPROVERS"]' $PROJECT_CONF
# remove empty line at end of project.yaml
printf %s "$(cat $PROJECT_CONF)" >$PROJECT_CONF