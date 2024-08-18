#!/bin/bash

set -e

# standard lint
cargo fmt --all -- --check
# clippy lint
cargo clippy --all-targets --all-features -- -D warnings
# unit test
cargo test
# test db
make --no-print-directory -C crates/pg test-db
# test integration
make --no-print-directory -C tests test-local
# test client
make --no-print-directory -C client test