import React from 'react'
import { shallow } from 'enzyme'
import RequestDetailScreen from '../RequestDetailScreen'
import { promiseToResolve, promiseToReject } from 'utils/testing'

const props = {
  match: { params: { uuid: '1234' } },
  user: { username: 'JoeSmith' }
}

describe('<RequestDetailScreen', () => {
  it('renders', () => {
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={() => Promise.resolve()} {...props} />
    )
    expect(wrapper.exists())
  })

  it('calls fetch after mount', () => {
    const requestMock = { timeuuid: 'x' }
    const fetchRequestMock = promiseToResolve(requestMock)
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={fetchRequestMock} {...props} />,
      {
        disableLifecycleMethods: true
      }
    )
    const instance = wrapper.instance()
    const fetchSpy = jest.spyOn(instance, 'handleFetchRequest')
    instance.componentDidMount()

    expect(fetchSpy).toHaveBeenCalled()
  })

  it('fetches request after mount', async () => {
    const requestMock = { timeuuid: 'x' }
    const fetchRequestMock = promiseToResolve(requestMock)
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={fetchRequestMock} {...props} />,
      {
        disableLifecycleMethods: true
      }
    )
    const instance = wrapper.instance()
    await instance.handleFetchRequest()
    expect(wrapper.state('request')).toEqual(requestMock)
  })

  it('saves errors if fetch fails', async () => {
    const errorMock = 'FetchError'
    const errorExpected = [
      { message: 'Request not found', error: 'FetchError' }
    ]
    const fetchRequestMock = promiseToReject(errorMock)
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={fetchRequestMock} {...props} />,
      {
        disableLifecycleMethods: true
      }
    )
    const instance = wrapper.instance()
    await instance.handleFetchRequest()
    expect(wrapper.state('errors')).toEqual(errorExpected)
  })

  it('sets isCredit based on request', async () => {
    const requestMock = { timeuuid: 'x', creditor: 'JoeSmith' }
    const fetchRequestMock = promiseToResolve(requestMock)
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={fetchRequestMock} {...props} />,
      {
        disableLifecycleMethods: true
      }
    )
    const instance = wrapper.instance()
    await instance.handleFetchRequest()
    expect(wrapper.state('isCredit')).toEqual(true)
  })
})
