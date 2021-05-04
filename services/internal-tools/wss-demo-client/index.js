const AWS = require('aws-sdk')
const WebSocket = require('ws')

const getToken = require('./getToken')

// env var inentory (avoid const assignments):
// process.env.CLIENT_ID
// process.env.ACCOUNT
// process.env.SECRET
// process.env.WEBSOCKET_CLIENT_URI
// process.env.AWS_REGION

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION,
})

;(async () => {
  const token = await getToken(
    cognitoIdsp,
    process.env.CLIENT_ID,
    process.env.ACCOUNT,
    process.env.SECRET,
    process.env.LOG_ID_TOKEN,
  );

  const ws = new WebSocket(process.env.WEBSOCKET_CLIENT_URI);

  ws.on('open', () => {
    console.log('socket opened');
    ws.send(JSON.stringify({
      action: "getnotifications",
      // pass token in every getnotifications message
      token: token,
    }));
  });

  ws.on('message', data => {
    if (process.env.ACTION === 'getnotifications') {
      console.log('response from get:');
      console.log(data);
      ws.close();
    };
    if (process.env.ACTION === 'clearnotifications') {
      let event = JSON.parse(data);
      if (event.cleared) {
        console.log('response from clear:');
        console.log(event);
        ws.close();
      } else {
        const event = JSON.parse(data);
        if (event.pending) {
          const IDsToDelete = event.pending.map(x => x.notification_id);
          const clearMessageRequest = JSON.stringify({
            action: "clearnotifications",
            notification_ids: IDsToDelete,
            // pass token in every clearnotifications message
            token: token,
          });
          console.log('sending clear message request as:');
          console.log(clearMessageRequest);
          ws.send(clearMessageRequest);
        } else {
          console.log('0 pending notifications to clear');
          ws.close();
        };
      };
    };
  });
})();