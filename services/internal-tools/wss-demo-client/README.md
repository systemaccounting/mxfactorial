<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

**client websocket integration**  
1. create a pending transaction notification by sending a transaction request to a test account from the ui, or postman
1. `cd services/internal-tools/wss-demo-client`
1. set `TEST_ACCOUNT`, `TEST_PASSWORD`, `LOG_ID_TOKEN` makefile variables
1. `make get-secrets ENV=dev` to create `.env` file from secrets manager
1. `make getnotifications` creates a websocket connection with api gateway, sends a `getnotifications` action and cognito account token, then prints the pending notication from step 1
1. `make clearnotifications` creates websocket connection with api gateway, sends a `clearnotifications` action and cognito account token, then prints the transaction notification id of the cleared notification

**print a cognito id token**

set makefile var `LOG_ID_TOKEN=true` in step 3

**javascript websocket connection**  

```js
const WebSocket = require('ws')

const ws = new WebSocket(process.env.WEBSOCKET_CLIENT_URI)
```

**get notifications**  
`pending` transaction notifications retrieved with `{"action":"getnotifications","token":"eyJraW..."}` websocket message:

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
      "notification_id": "13",
      "message": {
        "id": "10",
        "author": "GroceryCo",
        "sum_value": "21.8",
        "author_role": "creditor",
        "equilibrium_time": "2021-05-04T17:48:19.883877Z",
        "transaction_items": [
          {
            "id": "55",
            "price": "0.18",
            "debitor": "GroceryCo",
            "item_id": "9% state sales tax",
            "creditor": "StateOfCalifornia",
            "quantity": "1",
            "transaction_id": "10",
            "units_measured": null,
            "rule_instance_id": "1",
            "debitor_profile_id": "18",
            "creditor_profile_id": "16",
            "unit_of_measurement": "",
            "debitor_approval_time": "2021-05-04T17:47:54.737050Z",
            "creditor_approval_time": "2021-05-04T17:47:54.737050Z"
          },
          {
            "id": "56",
            "price": "0.27",
            "debitor": "GroceryCo",
            "item_id": "9% state sales tax",
            "creditor": "StateOfCalifornia",
            "quantity": "2",
            "transaction_id": "10",
            "units_measured": null,
            "rule_instance_id": "1",
            "debitor_profile_id": "18",
            "creditor_profile_id": "16",
            "unit_of_measurement": "",
            "debitor_approval_time": "2021-05-04T17:47:54.737050Z",
            "creditor_approval_time": "2021-05-04T17:47:54.737050Z"
          }
        ]
      }
    }
  ]
}
```
**clear notifications**  
transaction notifications cleared by sending `clearnotifications` websocket message:
```js

const clearMessageRequest = {
  "action":"clearnotifications",
  "notification_ids": ["4","6"],
  "token": "eyJraW...",
}

ws.send(clearMessageRequest)
```

client receives notification cleared confirmation:

```js
{ cleared: [ '6', '4' ] }
```