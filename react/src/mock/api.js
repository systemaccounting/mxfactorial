import * as R from 'ramda'

import { testPassword } from 'lib/user'

import data from './data.json'
import requests from './requests.json'
import history from './history'

const mapRequestsByStatus = R.pipe(
  R.groupBy(item => (item.rejection_time === '' ? 'active' : 'rejected'))
)(requests)

export const fetchTransactions = () => Promise.resolve(data)

export const fetchBalance = () => Promise.resolve(0)

export const fetchRequests = () => Promise.resolve(mapRequestsByStatus)

export const fetchHistory = () => Promise.resolve(history)

export const approveRequest = password =>
  new Promise((resolve, reject) => {
    if (testPassword(password)) {
      resolve(true)
    } else {
      reject({ error: 'PASSWORD_ERROR', message: 'Wrong password.' })
    }
  })

export const fetchRequest = uuid =>
  Promise.resolve(
    R.pipe(
      R.filter(item => item.timeuuid === uuid),
      R.head
    )(requests)
  )

export const fetchHistoryItem = timeuuid =>
  Promise.resolve(R.find(R.propEq({ timeuuid }))(history))
