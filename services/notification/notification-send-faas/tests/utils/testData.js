const randomSevenDigitInt = () => {
  return Math.floor(Math.random() * (9999999 - 1000000)) + 1000000
}
const pendingNotifications = [
  {
    id: 984,
    name: "eggs",
    price: "3.00",
    quantity: "4",
    author: "testauthor",
    creditor: "testcreditor1",
    debitor: "testdebitor1",
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
    debitor: "testdebitor1",
    transaction_id: "a61ee640-ed45-11e9-9d76-e5821046273b"
  }
]

const transactEvent = {
  service: 'TRANSACT',
  message: pendingNotifications
}

const snsEvent = {
  Records: [
    {
      Sns: {
        Message: JSON.stringify(transactEvent)
      }
    }
  ]
}

const testMessage = "[{\"id\":984,\"name\":\"eggs\",\"price\":\"3.00\",\"quantity\":\"4\",\"author\":\"testauthor\""
+ ",\"creditor\":\"testcreditor1\",\"debitor\":\"testdebitor1\",\"transaction_id\":\"a61ee640-ed45-11e9-9d76-e5821046273b\""
+ ",\"creditor_approval_time\":\"2019-10-12T23:11:42.108Z\"},{\"id\":985,\"name\":\"9% state sales tax\",\"price\":\"1.080\""
+ ",\"quantity\":\"1\",\"author\":\"testauthor\",\"creditor\":\"testcreditor2\",\"debitor\":\""
+ "testdebitor1\",\"transaction_id\":\"a61ee640-ed45-11e9-9d76-e5821046273b\"}]"

const pendingReceivedNotifications = [
  {
    uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
    timestamp: 1570139563495635,
    human_timestamp: "Thu, 03 Oct 2019 21:52:43 GMT",
    account: 'testdebitor1',
    message: testMessage
  },
  {
    uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
    timestamp: 1570139563495636,
    human_timestamp: "Thu, 03 Oct 2019 21:52:44 GMT",
    account: 'testdebitor2',
    message: testMessage
  },
  {
    uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
    timestamp: 1570139563495637,
    human_timestamp: "Thu, 03 Oct 2019 21:52:45 GMT",
    account: 'testdebitor3',
    message: testMessage
  },
  {
    uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
    timestamp: 1570139563495638,
    human_timestamp: "Thu, 03 Oct 2019 21:52:46 GMT",
    account: 'testdebitor4',
    message: testMessage
  },
]

const batchWriteNotifications = [
  {
    PutRequest: {
      Item: {
        uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
        timestamp: 1570139563495635,
        human_timestamp: "Thu, 03 Oct 2019 21:52:43 GMT",
        account: 'testdebitor1',
        message: testMessage
      }
    }
  },
  {
    PutRequest: {
      Item: {
        uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
        timestamp: 1570139563495636,
        human_timestamp: "Thu, 03 Oct 2019 21:52:44 GMT",
        account: 'testdebitor2',
        message: testMessage
      }
    }
  },
  {
    PutRequest: {
      Item: {
        uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
        timestamp: 1570139563495637,
        human_timestamp: "Thu, 03 Oct 2019 21:52:45 GMT",
        account: 'testdebitor3',
        message: testMessage
      }
    }
  },
  {
    PutRequest: {
      Item: {
        uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
        timestamp: 1570139563495638,
        human_timestamp: "Thu, 03 Oct 2019 21:52:46 GMT",
        account: 'testdebitor4',
        message: testMessage
      }
    }
  },
]

const notificationsToSend = [
  {
    uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
    timestamp: 1570139563495685,
    human_timestamp: 'Thu, 03 Oct 2019 21:52:43 GMT',
    account: 'testcreditor1',
    message: testMessage
  },
  {
    uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
    timestamp: 1570139563495694,
    human_timestamp: 'Thu, 03 Oct 2019 21:52:43 GMT',
    account: 'testcreditor2',
    message: testMessage
  },
  {
    uuid: 'a61ee640-ed45-11e9-9d76-e5821046273b',
    timestamp: 1570139563495700,
    human_timestamp: 'Thu, 03 Oct 2019 21:52:43 GMT',
    account: 'testdebitor1',
    message: testMessage
  }
]

const dedupedRecipientList = [ 'testcreditor1', 'testcreditor2', 'testdebitor1' ]

const TEST_ACCOUNT = 'Faker' + randomSevenDigitInt()

const pendingNotificationsForIntegrationTests = [
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

const transactIntegrationTestEvent = {
  service: 'TRANSACT',
  message: pendingNotificationsForIntegrationTests
}

const recipientListIntegrationTests = [ 'testcreditor1', 'testcreditor2', TEST_ACCOUNT ]

const websocketConnectionIds = [
  {
    connection_id: '12345678910',
    timestamp: 1570139563495635,
    account: TEST_ACCOUNT
  }
]

module.exports = {
  TEST_ACCOUNT,
  pendingNotifications,
  transactEvent,
  snsEvent,
  pendingReceivedNotifications,
  batchWriteNotifications,
  notificationsToSend,
  transactIntegrationTestEvent,
  dedupedRecipientList,
  recipientListIntegrationTests,
  websocketConnectionIds
}