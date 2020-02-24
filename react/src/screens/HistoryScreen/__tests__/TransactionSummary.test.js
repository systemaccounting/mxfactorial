import React from 'react'
import { shallow } from 'enzyme'
import { fromNow, maxDate } from 'utils/date'
import TransactionSummary from '../components/TransactionSummary'
import { formatCurrency } from 'utils/currency'

const transaction = {
  id: '1234',
  timeuuid: '1234',
  debitor: 'JoeSmith',
  creditor: 'Mary',
  name: 'bread',
  price: '3000.00',
  quantity: '2.00',
  transaction_id: '12345',
  creditor_approval_time: '2018-10-26T21:32:52',
  debitor_approval_time: '2018-08-26T21:32:52'
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
    const transactionTime = maxDate([
      transaction.creditor_approval_time,
      transaction.debitor_approval_time
    ])
    expect(timeEl.exists()).toBeTruthy()
    expect(timeEl.text()).toEqual(fromNow(transactionTime))
  })

  it('contains transaction partner', () => {
    const wrapper = shallow(<TransactionSummary {...props} />)
    const partnerEl = wrapper.find(selectors.transactionPartner)
    expect(partnerEl.exists()).toBeTruthy()
  })

  it('displays negative direction of transaction', () => {
    const wrapper = shallow(<TransactionSummary {...props} isCredit />)
    const amountEl = wrapper.find(selectors.transactionAmount)
    const total = transaction.quantity * transaction.price
    const expectedValue = `- ${formatCurrency(total)}`
    expect(amountEl.text()).toEqual(expectedValue)
  })

  it('displays positive direction of transaction', () => {
    const wrapper = shallow(<TransactionSummary {...props} isCredit={false} />)
    const amountEl = wrapper.find(selectors.transactionAmount)
    const total = transaction.quantity * transaction.price
    const expectedValue = `${formatCurrency(total)}`
    expect(amountEl.text()).toEqual(expectedValue)
  })
})
