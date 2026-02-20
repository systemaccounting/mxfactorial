#!/bin/bash

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash migrate.sh --dir /tmp/mxfactorial/migrations --subdirs schema,seed,testseed --cmd up

	possible values:
		subdirs: comma-separated migration subdirectories in execution order
		cmd: up, down, drop, reset
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
		--dir) DIR="$2"; shift ;;
		--subdirs) SUBDIRS="$2"; shift ;;
		--cmd) CMD="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done


if [[ -z "$DIR" ]]; then
	echo "error: DIR not set"
	exit 1
fi

if [[ -z "$SUBDIRS" ]]; then
	echo "error: SUBDIRS not set"
	exit 1
fi

ALLOWED_SUBDIRS=(schema seed testseed testseedthresh)
IFS=',' read -ra SUBDIR_ARGS <<< "$SUBDIRS"
for s in "${SUBDIR_ARGS[@]}"; do
	if [[ ! " ${ALLOWED_SUBDIRS[*]} " =~ " ${s} " ]]; then
		echo "error: unknown subdir '${s}'. allowed: ${ALLOWED_SUBDIRS[*]}"
		exit 1
	fi
done

if [[ -z "$CMD" ]]; then
	echo "error: CMD not set"
	exit 1
fi

if [[ -z "$SQL_TYPE" ]]; then
	echo "error: SQL_TYPE not set"
	exit 1
fi

if [[ -z "$PGUSER" ]]; then
	echo "error: PGUSER not set"
	exit 1
fi
if [[ -z "$PGPASSWORD" ]]; then
	echo "error: PGPASSWORD not set"
	exit 1
fi

if [[ -z "$PGHOST" ]]; then
	echo "error: PGHOST not set"
	exit 1
fi

if [[ -z "$PGPORT" ]]; then
	echo "error: PGPORT not set"
	exit 1
fi

if [[ -z "$PGDATABASE" ]]; then
	echo "error: PGDATABASE not set"
	exit 1
fi

# split comma-separated subdirs into array
IFS=',' read -ra UP_DIRS <<< "$SUBDIRS"

# reverse for down migrations
DOWN_DIRS=()
for (( i=${#UP_DIRS[@]}-1; i>=0; i-- )); do
	DOWN_DIRS+=("${UP_DIRS[$i]}")
done

function create_conn() {
	local MIGRATIONS_DIR="$1"
	CONN="${SQL_TYPE}://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=disable&x-migrations-table=migration_${MIGRATIONS_DIR}_version"
}

function up () {
	local MIGRATIONS_DIR="$1"
	local MIGRATIONS_PATH="${DIR}/${MIGRATIONS_DIR}"
	create_conn "$MIGRATIONS_DIR"
	migrate -verbose -path "$MIGRATIONS_PATH" -database "$CONN" up
}

function down () {
	local MIGRATIONS_DIR="$1"
	local MIGRATIONS_PATH="${DIR}/${MIGRATIONS_DIR}"
	create_conn "$MIGRATIONS_DIR"
	migrate -verbose -path "$MIGRATIONS_PATH" -database "$CONN" down --all
}

function drop () {
	# go-migrate fails to drop custom types until 09/2021 pull request merged:
	# https://github.com/golang-migrate/migrate/pull/627
	# migrate -verbose -path "$DIR" -database "$CONN" drop -f

	# https://www.postgresql.org/docs/current/app-psql.html
	DBNAME="host=$PGHOST port=$PGPORT user=$PGUSER password=$PGPASSWORD dbname=$PGDATABASE sslmode=disable"

	if [[ "$PGHOST" == 'localhost' ]]; then
		# https://stackoverflow.com/a/13823560
		psql -d "$DBNAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres;"
	else # rds
		psql -d "$DBNAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	fi
}

function up_migrate() {
	for MIG_DIR in "${UP_DIRS[@]}"; do
		up "$MIG_DIR"
	done
}

function down_migrate() {
	for MIG_DIR in "${DOWN_DIRS[@]}"; do
		down "$MIG_DIR"
	done
}

function reset() {
	drop
	up_migrate
}

case $CMD in
	up) up_migrate ;;
	down) down_migrate ;;
	drop) drop ;;
	reset) reset ;;
	*) echo "unknown command: $CMD"; exit 1 ;;
esac
