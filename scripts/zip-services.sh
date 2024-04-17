#!/bin/bash

if [[ $(basename $(pwd)) != "mxfactorial" ]]; then
	echo "error: current directory not project root. run this script from project root"
	exit 1
fi

PROJECT_CONF=project.yaml
SERVICES_ZIP=$(yq '.scripts.env_var.set.SERVICES_ZIP.default' $PROJECT_CONF)

rm -f $SERVICES_ZIP

echo '*** archiving current services code'

zip -r $SERVICES_ZIP \
	Cargo.toml \
	Cargo.lock \
	.cargo \
	docker \
	make \
	makefile \
	project.yaml \
	services \
	crates \
	tests \
	migrations/go-migrate \
	--exclude='*/.env' \
	--exclude='*/README.md' \
	--exclude='tests/testdata/*' \
	--exclude='tests/thunder-tests/*' \
	--exclude='services/graphql/postman/*' 1>/dev/null