#!/bin/bash

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/migrate.sh \
	        --branch develop \
			--subdirs schema,seed,testseed \
	        --command up # or down # or drop # or reset
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --branch) BRANCH="$2"; shift ;;
        --command) COMMAND="$2"; shift ;;
        --subdirs) SUBDIRS="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
GO_MIGRATE_PORT=$(yq '.migrations."go-migrate".env_var.set.GO_MIGRATE_PORT.default' $PROJECT_CONF)

HOST_ADDR=127.0.0.1
HOST_PORT=$GO_MIGRATE_PORT

# human readable json body
read -r -d '' BODY <<-EOF
{
	"branch": "${BRANCH}",
	"command": "${COMMAND}",
	"count": null,
	"version": null,
	"directory": null,
	"subdirs": "${SUBDIRS}"
}
EOF

# format json body for curl
PAYLOAD=$(echo "${BODY}" | yq -I0 .)

curl -s \
  -d "${PAYLOAD}" \
  -H 'Content-Type: application/json' \
  http://${HOST_ADDR}:${HOST_PORT}/