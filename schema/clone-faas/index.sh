handler () {
    set -e

    # set variables
    REPO='https://github.com/systemaccounting/mxfactorial.git'
    WRITABLE_LAMBDA_PATH='/tmp/mxfactorial/schema/migrate-faas/migrations'
    ZIP_FILENAME='diffs.zip'
    # MIGRATE_LAMBDA_ARN assigned in lambda env

    # parse event values
    EVENT_DATA=$1
    MIGRATION_COMMAND=$(echo $EVENT_DATA | jq -r ".command")
    MIGRATION_BRANCH=$(echo $EVENT_DATA | jq -r ".branch")

    # clean up between invocations
    rm -rf /tmp/mxfactorial

    # clone
    cd /tmp && git clone --depth 1 --single-branch --branch $MIGRATION_BRANCH $REPO

    # log cloned directory contents
    echo "diffs found: $(ls $WRITABLE_LAMBDA_PATH)"

    # log commit SHA
    echo "commit sha: $(cd $WRITABLE_LAMBDA_PATH && git rev-parse --short HEAD)"

    # create zip
    cd $WRITABLE_LAMBDA_PATH && zip -r $ZIP_FILENAME .

    # encode zip
    cd $WRITABLE_LAMBDA_PATH && base64 $ZIP_FILENAME > "$ZIP_FILENAME.b64"
    ENCODED_ZIP=$(cat "$WRITABLE_LAMBDA_PATH/$ZIP_FILENAME.b64")
    ESCAPED_ENCODED_ZIP=$(printf "%q" $ENCODED_ZIP)

    # echo "executing migration..."
    AWS_LAMBDA_INVOKE=$(aws lambda invoke \
        --region $AWS_REGION \
        --invocation-type RequestResponse \
        --function-name $MIGRATE_LAMBDA_ARN \
        --payload '{"command":"'"$MIGRATION_COMMAND"'","zip":"'"$ESCAPED_ENCODED_ZIP"'"}' \
        $WRITABLE_LAMBDA_PATH/invoke.log)

    echo $AWS_LAMBDA_INVOKE
    echo "migrations executed:"
    cat "$WRITABLE_LAMBDA_PATH/invoke.log"
    printf "\n"

    # ...must send your return value to stderr https://github.com/gkrizek/bash-lambda-layer/blob/master/README.md#caveats
    echo "$(cat $WRITABLE_LAMBDA_PATH/invoke.log)" >&2
}