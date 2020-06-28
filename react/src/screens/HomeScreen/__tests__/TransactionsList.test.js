import React from 'react'
import { shallow } from 'enzyme'
import { noop } from 'utils'
import TransactionsList from '../components/Transaction/TransactionsList'

describe('<TransactionsList />', () => {
  it('handles add transaction item', () => {
    const mockFields = {
      forEach: noop,
      map: noop,
      push: jest.fn()
    }
    const wrapper = shallow(<TransactionsList fields={mockFields} />)
    wrapper.find({ 'data-id': 'transaction-add' }).simulate('click')
    expect(mockFields.push).toHaveBeenCalled()
  })

  it('handles delete transaction', () => {
    const idxToDelete = 1
    const mockTransactions = [
      {
        uuid: '1234',
        name: 'x',
        price: 100,
        quantity: 2
      },
      {
        uuid: '1235',
        name: '',
        price: '',
        quantity: ''
      }
    ]
    const mockFields = {
      forEach: noop,
      map: iterator => mockTransactions.map(iterator),
      value: mockTransactions,
      length: mockTransactions.length,
      remove: jest.fn()
    }
    const wrapper = shallow(<TransactionsList fields={mockFields} />)
    wrapper
      .find({ name: 'delete-transaction' })
      .at(idxToDelete)
      .simulate('click')
    expect(mockFields.remove).toHaveBeenCalledWith(idxToDelete)
  })
})
