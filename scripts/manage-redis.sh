#!/bin/bash

set -e

# print use
if [[ "$#" -ne 1 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/manage-redis.sh --start # OR --stop OR --flush
	EOF
	exit 1
fi

function start() {
	COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
		-f ./docker/compose.yaml \
		up -d redis
}

function stop() {
	COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
		-f ./docker/compose.yaml \
		down
}

function flush() {
	PROJECT_CONF=project.yaml
	REDIS_DB=$(yq '.services.event.env_var.set.REDIS_DB.default' $PROJECT_CONF)
	REDIS_USERNAME=$(yq '.services.event.env_var.set.REDIS_USERNAME.default' $PROJECT_CONF)
	REDIS_PASSWORD=$(yq '.services.event.env_var.set.REDIS_PASSWORD.default' $PROJECT_CONF)
	REDIS_PORT=$(yq '.services.event.env_var.set.REDIS_PORT.default' $PROJECT_CONF)
	REDIS_HOST=$(yq '.services.event.env_var.set.REDIS_HOST.default' $PROJECT_CONF)
	REDIS_URI="redis://$REDIS_USERNAME:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT/$REDIS_DB"
	COMPOSE_PROJECT_NAME=$(yq '.name' ./docker/compose.yaml)
	CONTAINER_NAME="$COMPOSE_PROJECT_NAME-redis-1"
	PGPORT=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.PGPORT.default' $PROJECT_CONF)

	# test for compose or k8s
	if [[ "$PGPORT" == "5432" ]]; then
		docker exec -it $CONTAINER_NAME redis-cli --no-auth-warning -u $REDIS_URI FLUSHDB
	else
		POD=$(kubectl get pods -l app=redis -o jsonpath='{.items[0].metadata.name}')
		kubectl --stdin --tty exec $POD -- redis-cli --no-auth-warning -u $REDIS_URI FLUSHDB
	fi
}

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--start)
		start
		;;
	--stop)
		stop
		;;
	--flush)
		flush
		;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done
