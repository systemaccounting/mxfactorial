import React from 'react'
import T from 'prop-types'
import Paper from 'components/Paper'
import { Text, Small } from 'components/Typography'
import { fromNow } from 'utils/date'

function TransactionSummary({ createdAt, partner, amount }) {
  return (
    <Paper>
      <Small>
        {fromNow(createdAt)}, {partner}
      </Small>
      <Text textAlign="right" variant="medium">
        <strong>
          {amount}
        </strong>
      </Text>
    </Paper>
  )
}

TransactionSummary.propTypes = {
  createdAt: T.string.isRequired,
  partner: T.string.isRequired
}

export default TransactionSummary
