import React from 'react'
import T from 'prop-types'
import Paper from 'components/Paper'
import { Text, Small } from 'components/Typography'
import { fromNow } from 'utils/date'
import { formatCurrency } from 'utils/currency'

function TransactionSummary({ transaction }) {
  const { time, contraAccount, isCreditor, total } = transaction
  const amount = isCreditor ? total * -1 : total

  return (
    <Paper
      data-id="historyItemIndicator"
      data-transaction-id={transaction.transaction_id}
    >
      <Small>
        <span data-id="transactionTime">{fromNow(time)}</span>, {}
        <span data-id="transactionPartner">{contraAccount}</span>
      </Small>
      <Text textAlign="right" variant="medium">
        <strong data-id="transactionAmount">{formatCurrency(amount)}</strong>
      </Text>
    </Paper>
  )
}

TransactionSummary.propTypes = {
  transaction: T.shape({
    contraAccount: T.string.isRequired,
    time: T.string.isRequired,
    total: T.string.isRequired,
    isCreditor: T.bool.isRequired
  }).isRequired
}

TransactionSummary.defaultProps = {
  isCredit: false
}

export default TransactionSummary
