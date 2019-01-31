import React from 'react'
import T from 'prop-types'
import Form from 'components/Form'

import transactionSchema from './transactionSchema'

const TransactionItem = ({ transaction, onEdit, onInputBlur, editable }) => (
  <React.Fragment>
    <Form
      values={transaction}
      schema={transactionSchema}
      onValuesUpdate={onEdit(transaction.uuid)}
      onInputBlur={onInputBlur}
      disabled={!editable}
    />
  </React.Fragment>
)

TransactionItem.propTypes = {
  editable: T.bool
}

TransactionItem.defaultProps = {
  editable: true
}

export default TransactionItem
