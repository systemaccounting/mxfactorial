import React from 'react'
import T from 'prop-types'
import Paper from 'components/Paper'
import { Text, Small } from 'components/Typography'
import { fromNow } from 'utils/date'

function TransactionSummary({ transaction, isCredit }) {
  const {
    creditor_approval_time,
    debitor,
    creditor,
    price,
    quantity
  } = transaction
  const partner = isCredit ? debitor : creditor
  const total = price * quantity
  const amount = isCredit ? `- ${total}` : total
  return (
    <Paper data-id="historyItemIndicator">
      <Small>
        <span data-id="transactionTime">{fromNow(creditor_approval_time)}</span>
        , <span data-id="transactionPartner">{partner}</span>
      </Small>
      <Text textAlign="right" variant="medium">
        <strong data-id="transactionAmount">{amount}</strong>
      </Text>
    </Paper>
  )
}

TransactionSummary.propTypes = {
  transaction: T.shape({
    timeuuid: T.string.isRequired
  }).isRequired,
  isCredit: T.bool
}

TransactionSummary.defaultProps = {
  isCredit: false
}

export default TransactionSummary
