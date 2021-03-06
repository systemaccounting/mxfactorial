const {
  TEST_TOKEN
} = require('./testConstants')

const randomSevenDigitInt = () => {
  return Math.floor(Math.random() * (9999999 - 1000000)) + 1000000
}

const TEST_ACCOUNT = `Faker${randomSevenDigitInt()}`

const pendingNotifications = [
  {
    id: 984,
    name: "eggs",
    price: "3.00",
    quantity: "4",
    author: "testauthor",
    creditor: "testcreditor1",
    debitor: TEST_ACCOUNT,
    transaction_id: "a61ee640-ed45-11e9-9d76-e5821046273b",
    creditor_approval_time: "2019-10-12T23:11:42.108Z"
  },
  {
    id: 985,
    name: "9% state sales tax",
    price: "1.080",
    quantity: "1",
    author: "testauthor",
    creditor: "testcreditor2",
    debitor: TEST_ACCOUNT,
    transaction_id: "a61ee640-ed45-11e9-9d76-e5821046273b"
  }
]

const testMessage = "[{\"id\":984,\"name\":\"eggs\",\"price\":\"3.00\",\"quantity\":\"4\",\"author\":\"testauthor\""
+ ",\"creditor\":\"testcreditor1\",\"debitor\":\"testdebitor1\",\"transaction_id\":\"a61ee640-ed45-11e9-9d76-e5821046273b\""
+ ",\"creditor_approval_time\":\"2019-10-12T23:11:42.108Z\"},{\"id\":985,\"name\":\"9% state sales tax\",\"price\":\"1.080\""
+ ",\"quantity\":\"1\",\"author\":\"testauthor\",\"creditor\":\"testcreditor2\",\"debitor\":\""
+ "testdebitor1\",\"transaction_id\":\"a61ee640-ed45-11e9-9d76-e5821046273b\"}]"

const pendingReceivedNotifications = [
  {
    uuid: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8c',
    timestamp: 1570139563495635,
    human_timestamp: "Thu, 03 Oct 2019 21:52:43 GMT",
    account: 'testdebitor1',
    message: testMessage
  },
  {
    uuid: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d',
    timestamp: 1570139563495636,
    human_timestamp: "Thu, 03 Oct 2019 21:52:44 GMT",
    account: TEST_ACCOUNT,
    message: testMessage
  },
  {
    uuid: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8e',
    timestamp: 1570139563495637,
    human_timestamp: "Thu, 03 Oct 2019 21:52:45 GMT",
    account: 'testdebitor3',
    message: testMessage
  },
  {
    uuid: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8f',
    timestamp: 1570139563495638,
    human_timestamp: "Thu, 03 Oct 2019 21:52:46 GMT",
    account: 'testdebitor4',
    message: testMessage
  },
]

const notificationsToClear = {
  "action":"clearnotifications",
  "notifications":[
    {"uuid":"8f93fd24-e60b-11e9-a7a9-2b4645cb9b8c","timestamp":1570139563495706},
  ]
}

const batchWriteNotifications = [
  {
    "DeleteRequest": {
      "Key": {
        "uuid": "8f93fd20-e60b-11e9-a7a9-2b4645cb9b8c",
        "timestamp": 1570139563495635
      }
    }
  },
  {
    "DeleteRequest": {
      "Key": {
        "uuid": "8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d",
        "timestamp": 1570139563495636
      }
    }
  },
  {
    "DeleteRequest": {
      "Key": {
        "uuid": "8f93fd20-e60b-11e9-a7a9-2b4645cb9b8e",
        "timestamp": 1570139563495637
      }
    }
  },
  {
    "DeleteRequest": {
      "Key": {
        "uuid": "8f93fd20-e60b-11e9-a7a9-2b4645cb9b8f",
        "timestamp": 1570139563495638
      }
    }
  }
]

let websocketConnectionIds = [
  {
    connection_id: '12345678910',
    timestamp: 1570139563495635,
    account: TEST_ACCOUNT
  }
]

const clearNotificationsAction = `{"action":"clearnotifications","notifications":[{"uuid":"8f93fd24-e60b-11e9-a7a9-2b4645cb9b8c","timestamp":1570139563495706}],"token":"${TEST_TOKEN}"}`

const clearNotificationsActionWithMissingToken = `{"action":"clearnotifications","notifications":[{"uuid":"8f93fd24-e60b-11e9-a7a9-2b4645cb9b8c","timestamp":1570139563495706}],"token":""}`

const clearNotificationsActionWithMalformedToken = `{"action":"clearnotifications","notifications":[{"uuid":"8f93fd24-e60b-11e9-a7a9-2b4645cb9b8c","timestamp":1570139563495706}],"token":"malformed"}`

module.exports = {
  TEST_ACCOUNT,
  pendingNotifications,
  pendingReceivedNotifications,
  notificationsToClear,
  batchWriteNotifications,
  websocketConnectionIds,
  clearNotificationsAction,
  clearNotificationsActionWithMissingToken,
  clearNotificationsActionWithMalformedToken
}