import React from 'react'
import { shallow, mount } from 'enzyme'
import { Switch, BrowserRouter } from 'react-router-dom'

import { PrivateRoutes, Loading } from '..'

describe('<PrivateRoutes />', () => {
  it('renders', () => {
    const wrapper = shallow(<PrivateRoutes />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders loading if user loading', () => {
    const wrapper = shallow(<PrivateRoutes user={null} userLoading={true} />)
    expect(wrapper.find(Loading).exists())
  })

  it('doesnt render loading if user loaded', () => {
    const wrapper = shallow(
      <PrivateRoutes user={{ username: 'test' }} userLoading={false} />
    )
    expect(wrapper.find(Loading).exists()).toBeFalsy()
  })

  it('renders routes if user loaded', () => {
    jest.mock('react-router-dom', () => ({
      Switch: ({ children }) => <div>{children}</div>,
      Route: ({ children }) => <div>{children}</div>
    }))
    const wrapper = shallow(
      <PrivateRoutes user={{ username: 'test' }} userLoading={false} />
    )
    expect(wrapper.find('Switch').exists()).toBeTruthy()
    expect(wrapper.find('Route')).toHaveLength(6)
  })

  it('redirects to auth if user doesnt exist', () => {
    const replaceMock = jest.fn()
    const wrapper = shallow(
      <PrivateRoutes
        user={null}
        userLoading={false}
        history={{ replace: replaceMock }}
      />
    )
    const instance = wrapper.instance()
    instance.componentDidUpdate()
    expect(replaceMock).toHaveBeenCalledWith('/auth')
  })

  it('redirects to account on first render if user exists', () => {
    const pushMock = jest.fn()
    const replaceMock = jest.fn()
    const wrapper = shallow(
      <PrivateRoutes
        user={{ username: 'test' }}
        userLoading={false}
        location={{ pathname: '/' }}
        history={{ push: pushMock, replace: replaceMock }}
      />
    )
    const instance = wrapper.instance()
    instance.componentDidUpdate()
    expect(pushMock).toHaveBeenCalledWith('/account')
  })

  it('doesnt redirect if already user exists', () => {
    const pushMock = jest.fn()
    const replaceMock = jest.fn()
    const wrapper = shallow(
      <PrivateRoutes
        user={{ username: 'test' }}
        userLoading={false}
        location={{ pathname: '/account' }}
        history={{ push: pushMock, replace: replaceMock }}
      />
    )
    const instance = wrapper.instance()
    instance.componentDidUpdate()
    expect(pushMock).not.toHaveBeenCalledWith()
  })
})
