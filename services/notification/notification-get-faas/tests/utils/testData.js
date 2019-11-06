const {
  TEST_TOKEN
} = require('./testConstants')

const randomFourDigitInt = () => {
  return Math.floor(Math.random() * (9999 - 1000)) + 1000
}

const TEST_ACCOUNT = `Faker${randomFourDigitInt()}`

const pendingReceivedNotifications = [
  {
    uuid: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8c',
    timestamp: 1570139563495635,
    account: 'FakerAccount1',
    message: 'message 1'
  },
  {
    uuid: '8f93fd21-e60b-11e9-a7a9-2b4645cb9b8c',
    timestamp: 1570139563495685,
    account: 'FakerAccount2',
    message: 'message 2'
  },
  {
    uuid: '8f93fd22-e60b-11e9-a7a9-2b4645cb9b8c',
    timestamp: 1570139563495694,
    account: 'FakerAccount3',
    message: 'message 3'
  },
  {
    uuid: '8f93fd23-e60b-11e9-a7a9-2b4645cb9b8c',
    timestamp: 1570139563495700,
    account: TEST_ACCOUNT,
    message: 'message 4'
  },
  {
    uuid: '8f93fd24-e60b-11e9-a7a9-2b4645cb9b8c',
    timestamp: 1570139563495706,
    account: TEST_ACCOUNT,
    message: 'message 5'
  },
  {
    uuid: '8f93fd25-e60b-11e9-a7a9-2b4645cb9b8c',
    timestamp: 1570139563495713,
    account: TEST_ACCOUNT,
    message: 'message 6'
  }
]

const getNotificationsAction = `{"action":"getnotifications","token":"${TEST_TOKEN}"}`

const getNotificationsActionWithMissingToken = `{"action":"getnotifications","token":""}`

const getNotificationsActionWithMalformedToken = `{"action":"getnotifications","token":"malformed"}`

module.exports = {
  TEST_ACCOUNT,
  pendingReceivedNotifications,
  getNotificationsAction,
  getNotificationsActionWithMissingToken,
  getNotificationsActionWithMalformedToken,
}