import React from 'react'
import { shallow, mount } from 'enzyme'
import { UserConsumer, UserProvider } from './UserContext'

const currentUserInfoMock = jest.fn()
const subscribeMock = jest.fn()
const unsubscribeMock = jest.fn()
const singInPerformMock = {
  subscribe: subscribeMock,
  unsubscribe: unsubscribeMock
}

const props = {
  currentUserInfo: currentUserInfoMock,
  singInPerform: singInPerformMock
}

describe('<UserContext />', () => {
  it('renders', () => {
    const wrapper = shallow(
      <UserProvider {...props}>
        <div>Test</div>
      </UserProvider>
    )
    expect(wrapper.exists()).toBeTruthy()
  })

  it('gets user data and subscribes signInPerform subject', () => {
    const wrapper = shallow(
      <UserProvider {...props}>
        <div>Test</div>
      </UserProvider>
    )
    wrapper.update()
    // expect(currentUserInfoMock).toHaveBeenCalled()
    expect(subscribeMock).toHaveBeenCalled()
  })

  it('unsubscribes signInPerform subject on unmount', () => {
    const wrapper = shallow(
      <UserProvider {...props}>
        <div>Test</div>
      </UserProvider>
    )
    const instance = wrapper.instance()
    instance.componentWillUnmount()
    expect(unsubscribeMock).toHaveBeenCalled()
  })

  it('calls getUserData if its not set', async () => {
    const wrapper = shallow(
      <UserProvider {...props}>
        <div>Test</div>
      </UserProvider>
    )
    wrapper.setState({ user: 'x' })
    const instance = wrapper.instance()
    await instance.getLoggedUser()
    expect(currentUserInfoMock).toHaveBeenCalled()
  })

  it('consumer passes the data', () => {
    const ConstWrappedComp = () => (
      <UserConsumer>
        {props => {
          if (props.user) {
            return <div {...props}>Props</div>
          }
        }}
      </UserConsumer>
    )
    const wrapper = mount(<ConstWrappedComp />)
    expect(wrapper.exists())
  })
  it('consumer passes the data 2', () => {
    const childrenMock = jest.fn()
    const wrapper = mount(<UserConsumer children={childrenMock} />)
    expect(childrenMock).toHaveBeenCalled()
  })
})
