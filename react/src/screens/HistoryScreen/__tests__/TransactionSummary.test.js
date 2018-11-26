import React from 'react'
import { shallow } from 'enzyme'
import TransactionSummary from '../components/TransactionSummary'

const transaction = {
  timeuuid: '1234',
  debitor: 'JoeSmith',
  creditor: 'Mary',
  name: 'bread',
  price: '3000.00',
  quantity: '2.00',
  transaction_id: '12345',
  expiration_time: '2018-10-26T21:32:52',
  rejection_time: ''
}

const selectors = {
  transactionAmount: '[data-id="transactionAmount"]',
  transactionPartner: '[data-id="transactionPartner"]',
  transactionTime: '[data-id="transactionTime"]'
}

const props = {
  transaction
}

describe('<TransactionSummary />', () => {
  it('renders', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('contains transaction amount', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    const amountEl = wrapper.find(selectors.transactionAmount)
    expect(amountEl.exists()).toBeTruthy()
  })

  it('contains transaction time', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    const timeEl = wrapper.find(selectors.transactionTime)
    expect(timeEl.exists()).toBeTruthy()
  })

  it('contains transaction partner', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    const partnerEl = wrapper.find(selectors.transactionPartner)
    expect(partnerEl.exists()).toBeTruthy()
  })

  it('displays negative direction of transaction', () => {
    const wrapper = shallow(<TransactionSummary {...props} isCredit />)
    const amountEl = wrapper.find(selectors.transactionAmount)
    const expectedValue = `- ${transaction.quantity * transaction.price}`
    expect(amountEl.text()).toEqual(expectedValue)
  })

  it('displays positive direction of transaction', () => {
    const wrapper = shallow(<TransactionSummary {...props} isCredit={false} />)
    const amountEl = wrapper.find(selectors.transactionAmount)
    const expectedValue = `${transaction.quantity * transaction.price}`
    expect(amountEl.text()).toEqual(expectedValue)
  })
})
