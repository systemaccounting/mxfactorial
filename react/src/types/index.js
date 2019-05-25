import { shape, string } from 'prop-types'

export const TransactionType = shape({
  id: string.isRequired,
  author: string.isRequired,
  debitor: string.isRequired,
  creditor: string.isRequired
})
