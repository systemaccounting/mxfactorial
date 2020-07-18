import React from 'react'
import { Form } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import { mount } from 'enzyme'
import { createCalculator } from '../decorators'
import Transaction from '../components/Transaction'

const username = 'JoeSmith'
const initialValues = {
  recipient: 'Person1',
  type: 'credit',
  items: [
    {
      name: 'Milk',
      price: '3',
      quantity: '3',
      author: '',
      debitor: '',
      creditor: ''
    },
    {
      name: 'Honey',
      price: '3',
      quantity: '3',
      author: '',
      debitor: '',
      creditor: ''
    }
  ]
}

describe('Calculator decorator', () => {
  it('updates items correctly on recipient change', () => {
    const newRecipient = 'Person2'
    const calculator = createCalculator({ username })
    const onSubmit = jest.fn()
    const wrapper = mount(
      <Form
        component={Transaction}
        initialValues={initialValues}
        decorators={[calculator]}
        onSubmit={({ items }) => onSubmit(items)}
        mutators={arrayMutators}
      />
    )
    const recipient = wrapper.find('input[name="recipient"]')
    recipient.instance().value = newRecipient
    recipient.simulate('change')

    wrapper.find('form').simulate('submit')

    expect(onSubmit).toBeCalledWith(
      initialValues.items.map(item => ({
        ...item,
        author: username,
        creditor: username,
        debitor: newRecipient
      }))
    )
  })

  it('updates items correctly on transaction type change', () => {
    const calculator = createCalculator({ username })
    const onSubmit = jest.fn()
    const wrapper = mount(
      <Form
        component={Transaction}
        initialValues={initialValues}
        decorators={[calculator]}
        onSubmit={({ items }) => onSubmit(items)}
        mutators={arrayMutators}
      />
    )
    const debitBtn = wrapper.find('button[name="debit"]')
    debitBtn.simulate('click')

    wrapper.find('form').simulate('submit')

    expect(onSubmit).toBeCalledWith(
      initialValues.items.map(item => ({
        ...item,
        author: username,
        creditor: initialValues.recipient,
        debitor: username
      }))
    )
  })
})
