handler () {
    set -e

    LAMBDA_TMP_DIR='/tmp'
    INVOKE_LOG_FILE="$LAMBDA_TMP_DIR/invoke.log"
    FINAL_LOG_FILE="$LAMBDA_TMP_DIR/final.log"
    # clean up after previous invoke
    rm -f $INVOKE_LOG_FILE $FINAL_LOG_FILE

    # parse migration event values
    EVENT_DATA=$1
    EVENT_MESSAGE=$(echo $EVENT_DATA | jq -r '.Records[0].Sns.Message')
    BRANCH=$(echo $EVENT_MESSAGE | jq -r ".branch")
    DB_TYPE=$(echo $EVENT_MESSAGE | jq -r ".db_type")
    EVENT_PASSPHRASE=$(echo $EVENT_MESSAGE | jq -r ".passphrase")

    if [[ $PASSPHRASE != $EVENT_PASSPHRASE ]]; then
      echo 'not authd' >&2
      exit 1
    fi

    DOWN=(seed schema)
    UP=(schema seed)

    if [[ $DB_TYPE == 'test' ]]; then
      DOWN=(testseed "${DOWN[@]}")
      UP+=(testseed)
    fi

    function invoke() {
      aws lambda invoke \
      --region "${AWS_REGION}" \
      --invocation-type RequestResponse \
      --function-name "${MIGRATION_LAMBDA_ARN}" \
      --payload "{\"branch\":\""$BRANCH"\",\"command\":\""$1"\",\"count\":\"all\",\"directory\":\""$2"\"}" \
      "${INVOKE_LOG_FILE}"
      cat "${INVOKE_LOG_FILE}" >> "${FINAL_LOG_FILE}"
    }

    # todo: reduce 'drop' event payload to "command" property only
    function drop() {
      aws lambda invoke \
      --region "${AWS_REGION}" \
      --invocation-type RequestResponse \
      --function-name "${MIGRATION_LAMBDA_ARN}" \
      --payload "{\"branch\":\""$BRANCH"\",\"command\":\"drop\",\"directory\":\""$1"\"}" \
      "${INVOKE_LOG_FILE}"
      cat "${INVOKE_LOG_FILE}" >> "${FINAL_LOG_FILE}"
    }

    # down required because dropping types not supported until merged:
    # # https://github.com/golang-migrate/migrate/pull/627
    for i in ${DOWN[@]}
    do
      invoke 'down' $i
    done

    # drop db contents
    drop "${UP[@]:0:1}" # arg irrelevant, will remove after above todo

    # up migrate
    for j in ${UP[@]}
    do
      invoke 'up' $j
    done

    cat "${FINAL_LOG_FILE}" # cloudwatch
}