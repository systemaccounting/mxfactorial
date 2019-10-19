const runner = require('node-pg-migrate')
const util = require('util')
const fs = require('fs')
const exec = util.promisify(require('child_process').exec)
const writeFile = util.promisify(fs.writeFile)

// process.env.PGHOST
// process.env.PGDATABASE
// process.env.HOST
// process.env.PGUSER
// process.env.PGPASSWORD
// process.env.PGPORT

const WRITABLE_LAMBDA_PATH = '/tmp'
const ZIP_FILENAME = 'diffs.zip'
const UNZIPPED_DIFFS_DIR = 'unzipped-diffs'
const MIGRATIONS_TABLE_NAME = 'pgmigrations'

exports.handler = async event => {
  if (!event.command) {
    console.log(`No schema change command received`)
    return `Please supply schema change command, e.g. up, down`
  }
  const zipFile = new Buffer(event.zip, 'base64')
  // const base64DecodedZipWithClonedDiffs = Buffer.from(event.zip, 'base64')
  // add arn:aws:lambda:<region>:744348701589:layer:bash:5 layer published
  // from https://github.com/gkrizek/bash-lambda-layer before invoking.
  // configure 30s timeout on lambda
  await exec(`rm -rf ${WRITABLE_LAMBDA_PATH}/*`)
  await writeFile(`${WRITABLE_LAMBDA_PATH}/${ZIP_FILENAME}`, zipFile)
  await exec(`cd ${WRITABLE_LAMBDA_PATH} && unzip ${ZIP_FILENAME} -d ${UNZIPPED_DIFFS_DIR}`)
  const outputFromls = await exec(`ls ${WRITABLE_LAMBDA_PATH}/${UNZIPPED_DIFFS_DIR}`)
  const formatted = outputFromls.stdout.replace('\n', ' ').slice(0, -1)
  console.log(formatted)

  let opts = {
    direction: event.command,
    dir: `${WRITABLE_LAMBDA_PATH}/${UNZIPPED_DIFFS_DIR}`,
    migrationsTable: MIGRATIONS_TABLE_NAME
  }
  return runner(opts)
}