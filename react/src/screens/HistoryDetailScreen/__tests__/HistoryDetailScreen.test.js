import React from 'react'
import { shallow } from 'enzyme'
import { promiseToResolve } from 'utils/testing'
import HistoryDetailScreen from '../HistoryDetailScreen'

const props = {
  match: { params: { uuid: '1234' } },
  user: { username: 'JoeSmith' }
}

describe('<HistoryDetailScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(<HistoryDetailScreen {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('fetches history item after mount', async () => {
    const requestMock = { timeuuid: 'x' }
    const fetchRequestMock = promiseToResolve(requestMock)
    const wrapper = shallow(
      <HistoryDetailScreen fetchHistoryItem={fetchRequestMock} {...props} />
    )
    await wrapper.update()
    const instance = await wrapper.instance()
    await instance.componentDidMount()
    expect(wrapper.state('transaction')).toEqual(requestMock)
  })
})
