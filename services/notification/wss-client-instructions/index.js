const AWS = require('aws-sdk')
const WebSocket = require('ws')

const getToken = require('./getToken')

// env var inentory (avoid const assignments):
// process.env.CLIENT_ID
// process.env.ACCOUNT
// process.env.SECRET
// process.env.WSS_CLIENT_URL
// process.env.AWS_REGION

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION
})

const shapeClearnNotificationsRequest = notifications => {
  let notificationsToClear = []
  for (notification of notifications) {
    // console.log('clearing' + JSON.stringify(notification))
    notificationsToClear.push(notification)
  }
  let clearNotificationsRequest = {
    action: 'clearnotifications',
    notifications: notifications
  }
  return JSON.stringify(clearNotificationsRequest)
}

;(async () => {
  const token = await getToken(
    cognitoIdsp,
    process.env.CLIENT_ID,
    process.env.ACCOUNT,
    process.env.SECRET
  )
  const options = {
    headers: {
      Authorization: token
    }
  }
  const ws = new WebSocket(process.env.WSS_CLIENT_URL, options)
  ws.on('open', () => {
    console.log('socket opened')
    ws.send(JSON.stringify({"action":"getnotifications"}))
  })
  ws.on('message', data => {
    if (process.env.FLAG === 'get') {
      console.log('response from get:')
      console.log(data)
      ws.close()
    }
    if (process.env.FLAG === 'clear') {
      let event = JSON.parse(data)
      if (event.cleared) {
        console.log('response from clear:')
        console.log(event)
        ws.close()
      } else {
        const event = JSON.parse(data)
        const clearMessageRequest = shapeClearnNotificationsRequest(event.pending)
        console.log('sending clear message request as:')
        console.log(clearMessageRequest)
        ws.send(clearMessageRequest)
      }
    }
  })
})();