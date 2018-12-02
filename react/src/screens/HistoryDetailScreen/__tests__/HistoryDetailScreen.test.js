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
  fetchHistoryItem: fetchRequestMock
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
      maxDate([requestMock.cr_time, requestMock.db_time]),
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
    const preTransactionBalanceLabel = wrapper
      .find(selectors.preTransactionBalanceLabel)
      .render()
      .text()
    const postTransactionBalanceLabel = wrapper
      .find(selectors.postTransactionBalanceLabel)
      .render()
      .text()
    expect(transactionIdLabel).toEqual(labels.transactionIdLabel)
    expect(ruleInstanceIdsLabel).toEqual(labels.ruleInstanceIdsLabel)
    expect(preTransactionBalanceLabel).toEqual(
      labels.preTransactionBalanceLabel
    )
    expect(postTransactionBalanceLabel).toEqual(
      labels.postTransactionBalanceLabel
    )
  })
})
