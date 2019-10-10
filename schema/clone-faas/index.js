const aws = require('aws-sdk')
const lambda = new aws.Lambda()
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const readFile = util.promisify(fs.readFile)

const REPO = 'https://github.com/systemaccounting/mxfactorial.git'
const WRITABLE_LAMBDA_PATH = '/tmp/mxfactorial/schema/diffs'
const ZIP_FILENAME = 'diffs.zip'

exports.handler = async (event) => {

  // this condition repurposes this lambda to invoke another
  // lambda in a vpc, which warms up serverless aurora
  if (event.warmUp) {
    let warmUpParams = {
      FunctionName: process.env.WARM_UP_LAMBDA_ARN,
      Payload: JSON.stringify({})
    }
    const warmUpLambdaResponse = await lambda.invoke(warmUpParams).promise()
    return JSON.parse(warmUpLambdaResponse.Payload)
  }
  // serverless aurora warm up ends here

  const BRANCH = event.branch ? event.branch : 'develop'
  const SCHEMA_CHANGE_COMMAND = event.command

  const invokeSchemaUpdate = async args => {
    if (!args.zip) {
      console.log(`No zip created`)
      return `Failed to clone and zip schema diffs`
    }

    const params = {
      FunctionName: process.env.SCHEMA_UPDATE_LAMBDA_ARN,
      Payload: JSON.stringify({ zip: args.zip, command: args.command })
    }

    const schemaUpdateLambdaResponse = await lambda.invoke(params).promise()
    console.log('Schema update response: ', schemaUpdateLambdaResponse.Payload)
    return JSON.parse(schemaUpdateLambdaResponse.Payload)
  }

  // add arn:aws:lambda:<region>:744348701589:layer:bash:5 layer published
  // from https://github.com/gkrizek/bash-lambda-layer before invoking.
  // configure 10s timeout on lambda
  await exec(`rm -rf /tmp/*`) // wipe directory contents if lambda reused
  await exec(`cd /tmp && git clone --depth 1 --single-branch --branch ${BRANCH} ${REPO}`)
  const lsOutput = await exec(`ls ${WRITABLE_LAMBDA_PATH}`)
  const formattedFromls = lsOutput.stdout.replace('\n', ' ').slice(0, -1)
  console.log('diffs found: ' + formattedFromls)
  const commitSHA = await exec(`cd ${WRITABLE_LAMBDA_PATH} && git rev-parse --short HEAD`)
  console.log(`commit SHA: ${commitSHA.stdout}`)
  await exec(`cd ${WRITABLE_LAMBDA_PATH} && zip -r ${ZIP_FILENAME} .`)
  const base64Content = await readFile(`${WRITABLE_LAMBDA_PATH}/${ZIP_FILENAME}`, { encoding: 'base64' })
  return await invokeSchemaUpdate({ zip: base64Content, command: SCHEMA_CHANGE_COMMAND })
}