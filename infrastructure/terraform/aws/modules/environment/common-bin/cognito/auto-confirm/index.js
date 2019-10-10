const AWS = require('aws-sdk')

exports.handler = (event, context, callback) => {
  //auto-confirm user in Cognito
  const modifiedEvent = event
  modifiedEvent.response.autoConfirmUser = true
  console.log(event.response)
  context.done(null, modifiedEvent)
}
