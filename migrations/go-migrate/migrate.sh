#!/bin/bash

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash migrate.sh --dir /tmp/mxfactorial/migrations --db_type test --cmd up

	possible values:
		db_type: test, prod # prod excludes testseed data
		cmd: up, down, drop, reset
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
		--dir) DIR="$2"; shift ;;
		--db_type) DB_TYPE="$2"; shift ;;
		--cmd) CMD="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done


if [[ -z "$DIR" ]]; then
	echo "error: DIR not set"
	exit 1
fi

if [[ -z "$CMD" ]]; then
	echo "error: CMD not set"
	exit 1
fi

case $DB_TYPE in
	prod|test) ;;
	*) echo "info: unknown db_type: \"$DB_TYPE\". testseed data will be excluded by defaulting to prod"; DB_TYPE='prod' ;;
esac

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

PROD_UP=(schema seed)
PROD_DOWN=(seed schema)
# append testseed to PROD_UP to include testseed data
TEST_UP=("${PROD_UP[@]}" testseed)
# prepend testseed to PROD_DOWN to remove testseed data
TEST_DOWN=(testseed "${PROD_DOWN[@]}")

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
	if [[ "$DB_TYPE" == 'prod' ]]; then
		for MIG_DIR in "${PROD_UP[@]}"; do
			up "$MIG_DIR"
		done
	elif [[ "$DB_TYPE" == 'test' ]]; then
		for MIG_DIR in "${TEST_UP[@]}"; do
			up "$MIG_DIR"
		done
	else
		echo "error: unknown db_type: $DB_TYPE"
		exit 1
	fi
}

function down_migrate() {
	if [[ "$DB_TYPE" == 'prod' ]]; then
		for MIG_DIR in "${PROD_DOWN[@]}"; do
			down "$MIG_DIR"
		done
	elif [[ "$DB_TYPE" == 'test' ]]; then
		for MIG_DIR in "${TEST_DOWN[@]}"; do
			down "$MIG_DIR"
		done
	else
		echo "error: unknown db_type: $DB_TYPE"
		exit 1
	fi
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