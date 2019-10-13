const {
  dedupeTransactionNotificationRecipients,
  idAndTimestampNotifications,
  accountsReceivingTransactionNotifications,
  transactionNotificationsToSend,
} = require('./transact')

const {
  pendingNotifications,
  pendingReceivedNotifications,
  notificationsToSend,
  dedupedRecipientList
} = require('../tests/utils/testData')

const mockId = jest.fn()
  .mockImplementationOnce(() => '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd21-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd22-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd23-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd24-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd25-e60b-11e9-a7a9-2b4645cb9b8c')

const mockTime = {
  now: jest.fn()
    .mockImplementationOnce(() => 1570139563495635)
    .mockImplementationOnce(() => 1570139563495685)
    .mockImplementationOnce(() => 1570139563495694)
    .mockImplementationOnce(() => 1570139563495700)
    .mockImplementationOnce(() => 1570139563495706)
    .mockImplementationOnce(() => 1570139563495713)
}

describe('transact notification service', () => {

  test('dedupeTransactionNotificationRecipients dedupes creditors', () => {
    let expected = [ 'testcreditor1', 'testcreditor2' ]
    let result = dedupeTransactionNotificationRecipients(
      pendingNotifications,
      'creditor'
    )
    expect(result).toEqual(expected)
  })

  test('id and timestamp added to received notifications', () => {
    let expected = pendingReceivedNotifications[0]
    let TEST_RECIPIENT = 'testdebitor1'
    let result = idAndTimestampNotifications(
      mockId,
      mockTime,
      TEST_RECIPIENT,
      pendingNotifications
    )
    expect(result).toEqual(expected)
  })

  test('accountsReceivingTransactionNotifications dedupes creditors and debitors', () => {
    let expected = [ 'testcreditor1', 'testcreditor2', 'testdebitor1' ]
    let result = accountsReceivingTransactionNotifications(
      pendingNotifications,
      dedupeTransactionNotificationRecipients,
      'creditor',
      'debitor'
    )
    expect(result).toEqual(dedupedRecipientList)
  })

  test('transactionNotificationsToSend prepares 3 notifications', () => {
    let result = transactionNotificationsToSend(
      mockId,
      mockTime,
      dedupedRecipientList,
      pendingNotifications,
      idAndTimestampNotifications
    )
    expect(result).toEqual(notificationsToSend)
  })

})