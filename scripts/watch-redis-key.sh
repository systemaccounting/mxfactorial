#!/bin/bash

if [[ "$#" -ne 4 ]] && [[ "$#" -ne 5 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/watch-redis-key.sh --key gdp:usa:cal:sac --cmd watch # OR sub # OPTIONAL: --no-prefix-date
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --key) KEY="$2"; shift ;;
		--cmd) CMD="$2"; shift ;;
        --no-prefix-date) NO_PREFIX_DATE=1; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
REDIS_DB=$(yq '.services.event.env_var.set.REDIS_DB.default' $PROJECT_CONF)
REDIS_USERNAME=$(yq '.services.event.env_var.set.REDIS_USERNAME.default' $PROJECT_CONF)
REDIS_PASSWORD=$(yq '.services.event.env_var.set.REDIS_PASSWORD.default' $PROJECT_CONF)
REDIS_PORT=$(yq '.services.event.env_var.set.REDIS_PORT.default' $PROJECT_CONF)
REDIS_HOST=$(yq '.services.event.env_var.set.REDIS_HOST.default' $PROJECT_CONF)
REDIS_URI="redis://$REDIS_USERNAME:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT/$REDIS_DB"
COMPOSE_PROJECT_NAME=$(yq '.name' ./docker/compose.yaml)
CONTAINER_NAME="$COMPOSE_PROJECT_NAME-redis-1"

if [[ -z "$NO_PREFIX_DATE" ]]; then
	KEY=$(date -u "+%Y-%m-%d"):$KEY
fi

if [[ "$CMD" == "sub" ]]; then
	docker exec -it $CONTAINER_NAME redis-cli --csv --no-auth-warning -u $REDIS_URI SUBSCRIBE $KEY
	exit 0
fi

watch -n 0.5 "docker exec -it $CONTAINER_NAME redis-cli --no-auth-warning -u $REDIS_URI GET $KEY | xargs"