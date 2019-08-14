// s3 only offers InvokeFunction from event:
// https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html
// below adds UpdateFunctionCode feature from s3

const aws = require('aws-sdk')
const lambda = new aws.Lambda()

exports.handler = async (event) => {
  let resourceName = event.Records[0].s3.configurationId
  let S3Bucket = event.Records[0].s3.bucket.name
  let S3Key = event.Records[0].s3.object.key
  let S3ObjectVersion = event.Records[0].s3.object.versionId

  let layerRegex = /layer/g
  let srcRegex = /src/g

  // if layer, then publish layer
  if (layerRegex.test(S3Key)) {
    let layerParams = {
      Content: {
        S3Bucket,
        S3Key,
        S3ObjectVersion,
      },
      LayerName: resourceName
    }
    let { LayerArn, LayerVersionArn } = await lambda.publishLayerVersion(layerParams)
    .promise()
    .then(data => console.log(data))
    .catch(err => console.error(err, err.stack))

    // update functions dependent on new layer
    let layerArnRegex = new RegExp(LayerArn)
    let lambdaList = await lambda.listFunctions()
    .promise()
    .then(async data => {
      let nextPage = data.NextMarker
      lambdaList.push(...data.Functions)
      while(nextPage) {
        let nextListParams = {
          Marker: nextPage
        }
        await lambda.listFunctions(nextListParams)
        .promise()
        .then(nextData => {
          nextPage = nextData.NextMarker
          lambdaList.push(...nextData.Functions)
        })
        .catch(err => console.log(err, err.stack))
      }
    })
    .catch(err => console.log(err, err.stack))
    let lambdasWithLayers = lambdaList.filter(idx => idx.Layers)
    let lambdaLayersUpdated = 0
    for (lambdaFn of lambdasWithLayers) {
      for (layer of lambdaFn.Layers) {
        if (layerArnRegex.test(layer.Arn)) {
          if (layer.Arn !== LayerVersionArn) {
            let lambdaFnConfigUpdateParam = {
              FunctionName: lambdaFn.FunctionName,
              Layers: [
                layerArn
              ]
             }
             await lambda.updateFunctionConfiguration(lambdaFnConfigUpdateParam)
             .promise()
             .then(data => {
               console.log(`${lambdaFn.FunctionName} lambda received ${layerArn} on ${data.LastModified}`)
               lambdaLayersUpdated++
              })
             .catch(err => console.log(err, err.stack))
          }
        }
      }
    }
    await console.log(`Lambda layers updated: ${lambdaLayersUpdated}`)

  // if lambda code, update function
  } else if (srcRegex.test(S3Key)) {
    let lambdaParams = {
      FunctionName: resourceName,
      S3Bucket,
      S3Key,
      S3ObjectVersion,
      Publish: false
    }
    return lambda.updateFunctionCode(lambdaParams).promise()
    .then(data => console.log(data))
    .catch(err => console.error(err, err.stack))
  } else {
    return `no layer or src matched in evented ${S3Key} update`
  }
}
