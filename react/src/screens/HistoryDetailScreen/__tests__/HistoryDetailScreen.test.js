import React from 'react'
import { shallow } from 'enzyme'
import { promiseToResolve } from 'utils/testing'
import { dateString, maxDate } from 'utils/date'
import HistoryDetailScreen from '../HistoryDetailScreen'
import { labels } from '../constants'

const requestMock = {
  timeuuid: 'x',
  cr_time: '2018-06-26T21:32:52',
  db_time: '2018-08-26T21:32:52'
}
const fetchRequestMock = promiseToResolve(requestMock)

const props = {
  match: { params: { uuid: '1234' } },
  user: { username: 'JoeSmith' },
  fetchHistoryItem: fetchRequestMock,
  transactionAccount: 'Person1',
  ruleInstanceIds: [
    'f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6',
    '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
  ],
  transactionTime: '2020-02-29 08:50:28.715 +00:00',
  transactionItems: [
    {
      id: '3135',
      name: 'Milk',
      quantity: '2',
      price: '2',
      author: 'Person1',
      debitor: 'JoeSmith',
      creditor: 'Person1',
      creditor_approval_time: '2020-02-24 12:34:57.993 +00:00',
      debitor_approval_time: '2020-02-29 08:50:28.715 +00:00',
      expiration_time: '2021-01-05 17:22:25.764 +00:00',
      transaction_id: 'f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6'
    },
    {
      id: '3136',
      name: '9% state sales tax',
      quantity: '1',
      price: '0.360',
      author: 'Person1',
      debitor: 'JoeSmith',
      creditor: 'StateOfCalifornia',
      creditor_approval_time: '2020-02-24 12:34:57.993 +00:00',
      debitor_approval_time: '2020-02-29 08:50:28.715 +00:00',
      expiration_time: '2021-01-05 17:22:25.764 +00:00',
      transaction_id: 'f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6',
      rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
    }
  ]
}

const selectors = {
  transactionTimeIndicator: '[data-id="transactionTimeIndicator"]',
  transactionIdLabel: '[data-id="transactionIdLabel"]',
  ruleInstanceIdsLabel: '[data-id="ruleInstanceIdsLabel"]',
  preTransactionBalanceLabel: '[data-id="preTransactionBalanceLabel"]',
  postTransactionBalanceLabel: '[data-id="postTransactionBalanceLabel"]'
}

describe('<HistoryDetailScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HistoryDetailScreen {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('fetches history item after mount', async () => {
    const wrapper = shallow(<HistoryDetailScreen {...props} />)
    await wrapper.update()
    const instance = await wrapper.instance()
    await instance.componentDidMount()
    expect(wrapper.state('transaction')).toEqual(requestMock)
  })

  it('renders transaction time correctly', async () => {
    const wrapper = shallow(<HistoryDetailScreen {...props} />)
    await wrapper.update()
    const instance = await wrapper.instance()
    await instance.componentDidMount()
    const displayedDate = wrapper
      .find(selectors.transactionTimeIndicator)
      .render()
      .text()
    const expectedDate = dateString(
      props.transactionTime,
      'dddd, MMMM D, YYYY @ h:mm A [GMT]Z'
    )
    expect(expectedDate).toEqual(displayedDate)
  })

  it('renders labels correctly', async () => {
    const wrapper = shallow(<HistoryDetailScreen {...props} />)
    await wrapper.update()
    const instance = await wrapper.instance()
    await instance.componentDidMount()
    const transactionIdLabel = wrapper
      .find(selectors.transactionIdLabel)
      .render()
      .text()
    const ruleInstanceIdsLabel = wrapper
      .find(selectors.ruleInstanceIdsLabel)
      .render()
      .text()
    expect(transactionIdLabel).toEqual(labels.transactionIdLabel)
    expect(ruleInstanceIdsLabel).toEqual(labels.ruleInstanceIdsLabel)
  })
})
