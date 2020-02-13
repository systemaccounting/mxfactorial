import React from 'react'
import T from 'prop-types'
import Paper from 'components/Paper'
import { Text, Small } from 'components/Typography'
import { fromNow, maxDate } from 'utils/date'
import { formatCurrency } from 'utils/currency'

function TransactionSummary({ transaction, isCredit }) {
  const {
    creditor_approval_time,
    debitor_approval_time,
    debitor,
    creditor,
    price,
    quantity
  } = transaction
  const partner = isCredit ? debitor : creditor
  const transactionTime = maxDate([
    creditor_approval_time,
    debitor_approval_time
  ])
  const total = price * quantity
  const amount = isCredit ? total * -1 : total

  return (
    <Paper data-id="historyItemIndicator">
      <Small>
        <span data-id="transactionTime">{fromNow(transactionTime)}</span>, {}
        <span data-id="transactionPartner">{partner}</span>
      </Small>
      <Text textAlign="right" variant="medium">
        <strong data-id="transactionAmount">{formatCurrency(amount)}</strong>
      </Text>
    </Paper>
  )
}

TransactionSummary.propTypes = {
  transaction: T.shape({
    id: T.string.isRequired
  }).isRequired,
  isCredit: T.bool
}

TransactionSummary.defaultProps = {
  isCredit: false
}

export default TransactionSummary
