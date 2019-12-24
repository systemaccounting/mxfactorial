import { shape, string, arrayOf } from 'prop-types'

export const TransactionType = shape({
  author: string.isRequired,
  debitor: string.isRequired,
  creditor: string.isRequired
})

export const NotificationType = shape({
  uuid: string.isRequired,
  account: string.isRequired,
  message: arrayOf(TransactionType).isRequired
})
