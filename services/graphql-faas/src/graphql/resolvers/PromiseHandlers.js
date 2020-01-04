const goLambdaPromiseHandler = promise => {
  return promise.then(data => {
    const parseStringToJson = JSON.parse(data.Payload)
    const parseJsonToJsObject = JSON.parse(parseStringToJson)
    return parseJsonToJsObject
  })
  .catch(err => {
    // console.error(err, err.stack)
    return err
  })
}

const nodeLambdaPromiseHandler = promise => {
  return promise.then(data => {
    const response = JSON.parse(data.Payload)
    return response.data
  })
  .catch(err => {
    console.log(err.message)
    return err
  })
}

module.exports = {
  goLambdaPromiseHandler,
  nodeLambdaPromiseHandler
}