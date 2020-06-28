import React from 'react'
import { Field } from 'react-final-form'
import PropTypes from 'prop-types'
import { noop } from 'utils'

import RemoveButton from './RemoveButton'

import { InputField } from 'components/Form/Input'
import Button from 'components/Button'
import AddIcon from 'icons/AddIcon'

const EMPTY_TRANSACTION = {
  name: '',
  price: '',
  quantity: '',
  author: '',
  debitor: '',
  creditor: ''
}

const required = value => (value ? undefined : 'Required')

export default function TransactonsList({
  fields,
  author,
  debitor,
  creditor,
  onAddTransaction,
  onRemoveTransaction,
  onInputBlur
}) {
  const handleAddTransaction = () => {
    fields.push({
      ...EMPTY_TRANSACTION,
      author,
      debitor,
      creditor
    })

    setTimeout(onAddTransaction)
  }

  return (
    <>
      {fields.map((field, idx) => {
        const isLast = idx === fields.length - 1

        const handleRemoveTransaction = () => {
          const { name, price, quantity } = fields.value[idx]
          const isEmpty = name === '' && price === '' && quantity === ''

          if (fields.length > 1 && isEmpty) {
            fields.remove(idx)
          }

          if (isLast && !isEmpty) {
            fields.update(idx, {
              ...EMPTY_TRANSACTION,
              author,
              debitor,
              creditor
            })
          }

          onRemoveTransaction()
        }

        return (
          <React.Fragment key={`transaction-${idx}`}>
            <RemoveButton
              name="delete-transaction"
              onClick={handleRemoveTransaction}
            />
            <div data-id="user-item">
              <Field
                name={`${field}.name`}
                data-id={isLast ? 'transaction-add-name' : ''}
                component={InputField}
                placeholder="Item"
                onBlur={onInputBlur}
                validate={required}
              />
              <Field
                name={`${field}.price`}
                data-id={isLast ? 'transaction-add-price' : ''}
                component={InputField}
                placeholder="Price"
                onBlur={onInputBlur}
                validate={required}
              />
              <Field
                name={`${field}.quantity`}
                data-id={isLast ? 'transaction-add-quantity' : ''}
                component={InputField}
                placeholder="Quantity"
                onBlur={onInputBlur}
                validate={required}
              />
            </div>
          </React.Fragment>
        )
      })}
      <Button
        data-id="transaction-add"
        type="button"
        onClick={handleAddTransaction}
      >
        <AddIcon key="add-icon" /> Item
      </Button>
    </>
  )
}

TransactonsList.propTypes = {
  onAddTransaction: PropTypes.func,
  onRemoveTransaction: PropTypes.func,
  onInputBlur: PropTypes.func,
  author: PropTypes.string,
  debitor: PropTypes.string,
  creditor: PropTypes.string
}

TransactonsList.defaultProps = {
  author: '',
  debitor: '',
  creditor: '',
  onAddTransaction: noop,
  onRemoveTransaction: noop,
  onInputBlur: noop
}
