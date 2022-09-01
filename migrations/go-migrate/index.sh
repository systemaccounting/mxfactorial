handler () {
    set -e

    # set variables
    REPO='https://github.com/systemaccounting/mxfactorial.git'
    LAMBDA_TMP_DIR='/tmp'
    REPO_DIR="$LAMBDA_TMP_DIR/mxfactorial"
    LOG_FILE="$REPO_DIR/invoke.log"

    # parse migration event values
    EVENT_DATA=$1
    BRANCH=$(echo $EVENT_DATA | jq -r ".branch")
    DIRECTION=$(echo $EVENT_DATA | jq -r ".command")
    COUNT=$(echo $EVENT_DATA | jq -r ".count")
    VERSION=$(echo $EVENT_DATA | jq -r ".version")
    DIRECTORY=$(echo $EVENT_DATA | jq -r ".directory")

    # set event dependent migration values
    MIGRATIONS_DIR="$REPO_DIR/migrations/$DIRECTORY"
    VERSION_TABLE="migration_${DIRECTORY}_version"
    POSTGRESQL_CONNECTION="postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=disable&x-migrations-table=${VERSION_TABLE}"

    # build go migrate command
    CMD="migrate.linux-amd64 -verbose -path ${MIGRATIONS_DIR} -database \"${POSTGRESQL_CONNECTION}\""
    FORCE_CMD="${CMD} force"
    DROP_CMD="${CMD} drop -f"

    # test event for go migrate possible values
    if [[ "$DIRECTION" != 'up' ]] \
    && [[ "$DIRECTION" != 'down' ]] \
    && [[ "$DIRECTION" != 'force' ]] \
    && [[ "$DIRECTION" != 'drop' ]]
    then
      ERROR_DIRECTION="error: command neither up, down, force or drop"
      echo "${ERROR_DIRECTION}"
      echo "${ERROR_DIRECTION}">&2; exit 1
    fi

    # if force command, version must be a number
    if [[ "$DIRECTION" == 'force' ]]
    then
      # prior art https://stackoverflow.com/a/4137381
      if ! [[ "$VERSION" =~ ^[0-9]+$ ]]
      then
        FORCE_DIRECTION="error: force requires a number for version"
        echo "${FORCE_DIRECTION}"
        echo "${FORCE_DIRECTION}" >&2; exit 1
      fi
    fi

    if [[ "$DIRECTION" != 'drop' ]] && [[ "$DIRECTION" != 'force' ]]
    then
      # if count not a number, then must be 'all'
      if ! [[ "$COUNT" =~ ^[0-9]+$ ]]
      then
        if [[ "$COUNT" != 'all' ]]
        then
          ERROR_DIRECTION="error: count neither a number or 'all'"
          echo "${ERROR_DIRECTION}"
          echo "${ERROR_DIRECTION}" >&2; exit 1
        fi
      fi
    fi

    # go migrate down migrates all migrations when '--all' flag passed
    if [[ "$DIRECTION" == 'down' ]] && [[ "$COUNT" == 'all' ]]; then
      COUNT="--${COUNT}"
    fi

    # go migrate up migrates all migrations when count argument absent
    if [[ "$DIRECTION" == 'up' ]] && [[ "$COUNT" == 'all' ]]; then
      COUNT=
    fi

    # concat the go migrate command
    CMD="${CMD} ${DIRECTION} ${COUNT}"

    # shave off extra space when count empty
    if [[ -z "$COUNT" ]]
      then CMD="${CMD%?}"
    fi

    # set simpler drop command after up & down gymnastics
    # todo: offer automated solution to create database after drop
    if [[ "$DIRECTION" == 'drop' ]]
      then CMD="${DROP_CMD}"
    fi

    # set simpler force command after up & down gymnastics
    if [[ "$DIRECTION" == 'force' ]]
      then CMD="${FORCE_CMD} ${VERSION}"
    fi

    # show go migrate command
    echo -e "\nrunning: \"$CMD\""

    # clean up between invocations
    rm -rf $REPO_DIR

    # clone
    echo "git clone --depth 1 --single-branch --branch $BRANCH $REPO $REPO_DIR"
    git clone --depth 1 --single-branch --branch $BRANCH $REPO $REPO_DIR

    # log commit SHA
    echo -e "\ncommit sha: $(cd $REPO_DIR && git rev-parse --short HEAD)"

    # log cloned directory contents
    echo -e "\nmigrations found in $MIGRATIONS_DIR:\n$(ls $MIGRATIONS_DIR)\n"

    # run
    eval "$CMD &> $LOG_FILE"
    cat $LOG_FILE

    # ...must send your return value to stderr https://github.com/gkrizek/bash-lambda-layer/blob/master/README.md#caveats
    cat $LOG_FILE >&2
}