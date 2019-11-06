<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

**client websocket integration**  
1. send transaction request to test account in ui
1. `cd services/notification/client-instructions`
1. assign test account and password to `ACCOUNT` and `SECRET` env vars in .env file
1. add `WSS_CLIENT_URL`, `CLIENT_ID` and `AWS_REGION` env var assignments in .env file
1. `yarn get` to print **pending** notifications for `ACCOUNT`
1. `yarn clear` to print **cleared** notifications for `ACCOUNT`

**node.js connection**  

```js
const WebSocket = require('ws')

const ws = new WebSocket(process.env.WSS_CLIENT_URL)
```

**get notifications**  
`pending` transaction notifications retrieved with `JSON.stringify({"action":"getnotifications","token":"eyJraW..."})` websocket message:

```js

const token = await getToken(
  cognitoIdsp,
  process.env.CLIENT_ID,
  process.env.ACCOUNT,
  process.env.SECRET
)

ws.on('open', () => {
  console.log('socket opened')
  ws.send(JSON.stringify({
    action: "getnotifications",
    token // pass token in every getnotifications message
  }))
})
ws.on('message', data => {
  console.log(data)
  ws.close()
})

// =>
{
  "pending": [
    {
      "account": "testdebitor1",
      "human_timestamp": "Mon, 14 Oct 2019 03:53:37 GMT",
      "uuid": "33c3b7a1-ee36-11e9-bd93-af1b5976b6e5",
      "message": "[{\"id\":988,\"name\":\"tomato\",\"price\":\"1.25\",\"quantity\":\"4\",\"author\":\"testcreditor1\",\"creditor\":\"testcreditor1\",\"debitor\":\"testdebito1\",\"transaction_id\":\"31d220d0-ee36-11e9-a08d-eddd90f18287\",\"creditor_approval_time\":\"2019-10-14T03:53:35.881Z\"},{\"id\":989,\"name\":\"9% state sales tax\",\"price\":\"0.450\",\"quantity\":\"1\",\"author\":\"testcreditor1\",\"creditor\":\"testcreditor2\",\"debitor\":\"testdebitor1\",\"transaction_id\":\"31d220d0-ee36-11e9-a08d-eddd90f18287\"}]",
      "timestamp": 1571025217562062
    }
  ]
}
```

transaction item array stored as notification `message` value. items grouped by common `transaction_id` value:
```json
[
  {
    "id": 988,
    "name": "tomato",
    "price": "1.25",
    "quantity": "4",
    "author": "testcreditor1",
    "creditor": "testcreditor1",
    "debitor": "testdebito1",
    "transaction_id": "31d220d0-ee36-11e9-a08d-eddd90f18287",
    "creditor_approval_time": "2019-10-14T03:53:35.881Z"
  },
  {
    "id": 989,
    "name": "9% state sales tax",
    "price": "0.450",
    "quantity": "1",
    "author": "testcreditor1",
    "creditor": "testcreditor2",
    "debitor": "testdebitor1",
    "transaction_id": "31d220d0-ee36-11e9-a08d-eddd90f18287"
  }
]
```

**clear notifications**  
transaction notifications cleared by sending `clearnotifications` websocket message:
```js
const getNotificationEvent = JSON.parse(data)

const clearMessageRequest = JSON.stringify({
  action: "clearnotifications",
  notifications: getNotificationEvent.pending),
  token // pass token in every clearnotifications message
})

ws.send(clearMessageRequest)

// sent as:
{
  "action": "clearnotifications",
  "token": "eyJraW...",
  "notifications": [
    {
      "account": "testdebitor1",
      "human_timestamp": "Mon, 14 Oct 2019 03:53:37 GMT",
      "uuid": "33c3b7a1-ee36-11e9-bd93-af1b5976b6e5",
      "message": "[{\"id\":988,\"name\":\"tomato\",\"price\":\"1.25\",\"quantity\":\"4\",\"author\":\"testcreditor1\",\"creditor\":\"testcreditor1\",\"debitor\":\"testdebito1\",\"transaction_id\":\"31d220d0-ee36-11e9-a08d-eddd90f18287\",\"creditor_approval_time\":\"2019-10-14T03:53:35.881Z\"},{\"id\":989,\"name\":\"9% state sales tax\",\"price\":\"0.450\",\"quantity\":\"1\",\"author\":\"testcreditor1\",\"creditor\":\"testcreditor2\",\"debitor\":\"testdebitor1\",\"transaction_id\":\"31d220d0-ee36-11e9-a08d-eddd90f18287\"}]",
      "timestamp": 1571025217562062
    }
  ]
}
```

** notification service references `uuid` and `timestamp` to clear messages

client receives notification cleared confirmation:
```js
{
  cleared: [
    {
      "account": "testdebitor1",
      "human_timestamp": "Mon, 14 Oct 2019 03:53:37 GMT",
      "uuid": "33c3b7a1-ee36-11e9-bd93-af1b5976b6e5",
      "message": "[{\"id\":988,\"name\":\"tomato\",\"price\":\"1.25\",\"quantity\":\"4\",\"author\":\"testcreditor1\",\"creditor\":\"testcreditor1\",\"debitor\":\"testdebito1\",\"transaction_id\":\"31d220d0-ee36-11e9-a08d-eddd90f18287\",\"creditor_approval_time\":\"2019-10-14T03:53:35.881Z\"},{\"id\":989,\"name\":\"9% state sales tax\",\"price\":\"0.450\",\"quantity\":\"1\",\"author\":\"testcreditor1\",\"creditor\":\"testcreditor2\",\"debitor\":\"testdebitor1\",\"transaction_id\":\"31d220d0-ee36-11e9-a08d-eddd90f18287\"}]",
      "timestamp": 1571025217562062
    }
  ]
}
```