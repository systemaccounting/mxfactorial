const aws = require('aws-sdk')
const lambda = new aws.Lambda()
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const readFile = util.promisify(fs.readFile)

const REPO = 'https://github.com/systemaccounting/mxfactorial.git'
const WRITABLE_LAMBDA_PATH = '/tmp/mxfactorial/schema/migrate-faas/migrations'
const ZIP_FILENAME = 'diffs.zip'

// env var inventory:
// process.env.MIGRATE_LAMBDA_ARN

exports.handler = async (event) => {
  console.log(event)
  // expected:
  // event.branch
  // event.command

  let invokeSchemaUpdate = async args => {
    if (!args.zip) {
      console.log(`No zip created`)
      return `Failed to clone and zip schema diffs`
    }

    let params = {
      FunctionName: process.env.MIGRATE_LAMBDA_ARN,
      Payload: JSON.stringify({ zip: args.zip, command: args.command })
    }

    let schemaUpdateLambdaResponse = await lambda.invoke(params).promise()
    console.log('Schema update response: ', schemaUpdateLambdaResponse.Payload)
    return JSON.parse(schemaUpdateLambdaResponse.Payload)
  }

  // add arn:aws:lambda:<region>:744348701589:layer:bash:5 layer published
  // from https://github.com/gkrizek/bash-lambda-layer before invoking.
  // configure 10s timeout on lambda
  await exec(`rm -rf /tmp/*`) // wipe directory contents if lambda reused
  await exec(`cd /tmp && git clone --depth 1 --single-branch --branch ${event.branch} ${REPO}`)
  let lsOutput = await exec(`ls ${WRITABLE_LAMBDA_PATH}`)
  if (lsOutput.errorMessage) { return lsOutput.errorMessage }
  let formattedFromls = lsOutput.stdout.replace('\n', ' ').slice(0, -1)
  console.log('diffs found: ' + formattedFromls)
  let commitSHA = await exec(`cd ${WRITABLE_LAMBDA_PATH} && git rev-parse --short HEAD`)
  console.log(`commit SHA: ${commitSHA.stdout}`)
  await exec(`cd ${WRITABLE_LAMBDA_PATH} && zip -r ${ZIP_FILENAME} .`)
  let base64Content = await readFile(`${WRITABLE_LAMBDA_PATH}/${ZIP_FILENAME}`, { encoding: 'base64' })
  return await invokeSchemaUpdate({ zip: base64Content, command: event.command })
}