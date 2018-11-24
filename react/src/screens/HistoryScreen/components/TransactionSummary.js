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
    <Paper>
      <Small>
        {fromNow(creditor_approval_time)}, {partner}
      </Small>
      <Text textAlign="right" variant="medium">
        <strong>{amount}</strong>
      </Text>
    </Paper>
  )
}

TransactionSummary.propTypes = {
  transaction: T.shape({
    timeuuid: T.string.isRequired
  }).isRequired,
  isCredit: T.bool.isRequired
}

export default TransactionSummary
