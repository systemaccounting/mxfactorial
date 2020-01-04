const dedupeTransactionNotificationRecipients = (
  notifications,
  debitorOrCreditor
  ) => {
  let accountsReceivingNotification = []
  for (notification of notifications) {
    accountsReceivingNotification.push(notification[debitorOrCreditor])
  }
  return [ ...new Set(accountsReceivingNotification)]
}

const idAndTimestampNotifications = (
  timeService,
  account,
  message
  ) => {
  let currentTime = timeService.now()
  let humanTimestamp = new Date(currentTime/1000).toUTCString()
  return {
    uuid: message[0].transaction_id, // set notification uuid to transaction_id
    timestamp: currentTime,
    human_timestamp: humanTimestamp,
    account,
    message: JSON.stringify(message)
  }
}

const accountsReceivingTransactionNotifications = (
  transactionList,
  dedupeFunc,
  creditorProp,
  debitorProp
  ) => {
  let dedupedAccounts = []
  // list unique creditor accounts in transactions
  let dedupedCreditors = dedupeFunc(
    transactionList,
    creditorProp
  )
  dedupedAccounts.push(...dedupedCreditors)
  // list unique debitor accounts in transactions
  let dedupedDebitors = dedupeFunc(
    transactionList,
    debitorProp
  )
  dedupedAccounts.push(...dedupedDebitors)
  return dedupedAccounts
}

const transactionNotificationsToSend = (
  timeService,
  recipientList,
  transactionList,
  idAndTimeStampFunc
  ) => {
  let toSend = []
  for (account of recipientList) {
    let accountSpecificNotification = idAndTimeStampFunc(
      timeService,
      account,
      transactionList
    )
    toSend.push(accountSpecificNotification)
  }
  return toSend
}

module.exports = {
  dedupeTransactionNotificationRecipients,
  idAndTimestampNotifications,
  accountsReceivingTransactionNotifications,
  transactionNotificationsToSend,
}