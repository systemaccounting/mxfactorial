import React from 'react'
import { shallow } from 'enzyme'
import CreateAccount from '../CreateAccount'
import TermsOfUse from '../TermsOfUse'
import Form from 'components/Form'

import { promiseToResolve, promiseToReject } from 'utils/testing'

describe('<CreateAccout />', () => {
  it('renders', () => {
    const wrapper = shallow(<CreateAccount />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders terms of uses', () => {
    const wrapper = shallow(<CreateAccount />)
    expect(wrapper.find(TermsOfUse)).toHaveLength(3)
  })

  it('renders forms', () => {
    const wrapper = shallow(<CreateAccount />)
    expect(wrapper.find(Form)).toHaveLength(6)
  })

  it('handles nextStep on form submit', () => {
    const wrapper = shallow(<CreateAccount />)
    const form = wrapper.find(Form).first()
    form.simulate('submit', { x: 'x' })
    expect(wrapper.state()).toEqual({ step: 1, data: { x: 'x' }, errors: null })
    form.simulate('submit', null)
    expect(wrapper.state()).toEqual({ step: 2, data: { x: 'x' }, errors: null })
  })

  it('calls handleSignUp on last form submit', () => {
    const signUpMock = promiseToResolve()
    const wrapper = shallow(<CreateAccount signUp={signUpMock} />)
    wrapper.setState({ step: 8 })
    const instance = wrapper.instance()
    const submitSpy = jest.spyOn(instance, 'handleSignUp')
    const form = wrapper.find(Form).first()
    form.simulate('submit')
    expect(submitSpy).toHaveBeenCalled()
  })

  it('handles nextStep', () => {
    const wrapper = shallow(<CreateAccount />)
    const instance = wrapper.instance()
    instance.handleNextTermOfUse()
    expect(wrapper.state()).toEqual({ step: 1, data: {}, errors: null })
  })

  it('handles signup with no errors', () => {
    const data = {
      username: 'testuser',
      password: 'password',
      email: 'test@test.com'
    }
    const signUpMock = promiseToResolve(data)
    const navigateMock = jest.fn()
    const wrapper = shallow(
      <CreateAccount navigate={navigateMock} signUp={signUpMock} />
    )
    wrapper.setState({
      data,
      step: 10
    })
    wrapper.update()
    const instance = wrapper.instance()
    instance.handleSignUp().then(() => {
      expect(navigateMock).toHaveBeenCalledWith('/')
    })
  })

  it('handles signup with errors', () => {
    const data = {
      username: 'testuser',
      password: 'password',
      email: 'test@test.com'
    }
    const signUpMock = promiseToReject({ errors: 'error' })
    const navigateMock = jest.fn()
    const wrapper = shallow(
      <CreateAccount navigate={navigateMock} signUp={signUpMock} />
    )
    wrapper.setState({
      data,
      step: 10
    })
    wrapper.update()
    const instance = wrapper.instance()
    instance.handleSignUp().catch(errors => {
      expect(wrapper.state('errors')).toEqual(errors)
    })
  })
})
