import React from 'react'
import Form from 'components/Form'

import transactionSchema from './transactionSchema'

const TransactionItem = ({ transaction, onEdit }) => (
  <React.Fragment>
    <Form
      values={transaction}
      schema={transactionSchema}
      onValuesUpdate={onEdit(transaction.uuid)}
    />
  </React.Fragment>
)

export default TransactionItem
