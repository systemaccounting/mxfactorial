import React from 'react'
import { shallow } from 'enzyme'
import { promiseToResolve } from 'utils/testing'
import { dateString, maxDate } from 'utils/date'
import HistoryDetailScreen from '../HistoryDetailScreen'

const requestMock = {
  timeuuid: 'x',
  'cr_time': '2018-06-26T21:32:52',
  'db_time': '2018-08-26T21:32:52'
}
const fetchRequestMock = promiseToResolve(requestMock)

const props = {
  match: { params: { uuid: '1234' } },
  user: { username: 'JoeSmith' },
  fetchHistoryItem: fetchRequestMock,
}

describe('<HistoryDetailScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HistoryDetailScreen {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('fetches history item after mount', async () => {
    const wrapper = shallow(
      <HistoryDetailScreen {...props} />
    )
    await wrapper.update()
    const instance = await wrapper.instance()
    await instance.componentDidMount()
    expect(wrapper.state('transaction')).toEqual(requestMock)
  })

  it('displays transaction time correctly', async () => {
    const wrapper = shallow(
      <HistoryDetailScreen {...props} />
    )
    await wrapper.update()
    const instance = await wrapper.instance()
    await instance.componentDidMount()
    const displayedDate = wrapper.find('[data-id="transactionTimeIndicator"]').render().text()
    const expectedDate = dateString(
      maxDate([requestMock.cr_time, requestMock.db_time]),
      'dddd, MMMM D, YYYY @ h:mm A [GMT]Z'
    )
    expect(expectedDate).toEqual(displayedDate)
  })
})
