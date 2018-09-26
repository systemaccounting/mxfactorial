import React from 'react'
import { shallow } from 'enzyme'

import { promiseToResolve, promiseToReject } from 'utils/testing'

import LandingScreen, { IntroStyled } from '../LandingScreen'

describe('<Landing Screen />', () => {
  it('renders', () => {
    const wrapper = shallow(<LandingScreen />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('handles auth', () => {
    const data = {
      account: 'x',
      password: 'x'
    }
    const navigateMock = jest.fn()
    const signInMock = promiseToResolve(data)
    const wrapper = shallow(
      <LandingScreen navigate={navigateMock} signIn={signInMock} />
    )

    const instance = wrapper.instance()

    instance
      .handleAuth([data])
      .then(res => expect(navigateMock).toHaveBeenCalled())
  })

  it('errors on auth', async () => {
    const data = {
      account: 'x',
      password: 'x'
    }
    const navigateMock = jest.fn()
    const signInMock = promiseToReject(data)
    const wrapper = shallow(
      <LandingScreen navigate={navigateMock} signIn={signInMock} />
    )

    const instance = wrapper.instance()
    const spy = jest.spyOn(instance, 'showErrors')
    await instance.handleAuth([data])
    expect(spy).toHaveBeenCalled()
  })

  it('renders Intro', () => {
    const wrapper = shallow(<LandingScreen />)
    const intro = wrapper.find(IntroStyled)
    expect(intro.exists()).toBeTruthy()
  })
})
