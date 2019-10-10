const dedupeAccounts = notifications => {
  let accountsReceivingNotification = []
  for (notification of notifications) {
    accountsReceivingNotification.push(notification.account)
  }

  return [ ...new Set(accountsReceivingNotification) ]
}

module.exports = {
  dedupeAccounts
}