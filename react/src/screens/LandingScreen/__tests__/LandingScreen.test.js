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
    const signInMock = promiseToResolve(data)
    const replaceMock = jest.fn()
    const wrapper = shallow(
      <LandingScreen history={{ replace: replaceMock }} signIn={signInMock} />
    )

    const instance = wrapper.instance()

    instance
      .handleAuth([data])
      .then(() => expect(replaceMock).toHaveBeenCalled())
  })

  it('errors on auth', async () => {
    const data = {
      account: 'x',
      password: 'x'
    }
    const error = { message: 'cant auth' }
    const replaceMock = jest.fn()
    const signInMock = promiseToReject(error)
    const wrapper = shallow(
      <LandingScreen history={{ replace: replaceMock }} signIn={signInMock} />
    )

    const instance = wrapper.instance()
    const spy = jest.spyOn(instance, 'showErrors')
    await instance.handleAuth([data])
    expect(wrapper.state('errors')).toEqual(error)
  })

  it('renders Intro', () => {
    const wrapper = shallow(<LandingScreen />)
    const intro = wrapper.find(IntroStyled)
    expect(intro.exists()).toBeTruthy()
  })
})
