import React from 'react'
import { shallow } from 'enzyme'

import Menu, { Mask } from './index'

import { promiseToResolve } from 'utils/testing'

describe('<Menu />', () => {
  it('renders', () => {
    const wrapper = shallow(<Menu />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('adds/removes event listeners on mount/unmount', () => {
    const spyAdd = jest.spyOn(document, 'addEventListener')
    const spyRemove = jest.spyOn(document, 'removeEventListener')
    const wrapper = shallow(<Menu />)
    expect(spyAdd).toHaveBeenCalled()
    const instance = wrapper.instance()
    instance.componentWillUnMount()
    expect(spyRemove).toHaveBeenCalled()
  })

  it('closes on mask click', () => {
    const wrapper = shallow(<Menu />)
    wrapper.setState({ active: true })
    wrapper.update()
    const mask = wrapper.find(Mask)
    expect(mask.exists()).toBeTruthy()
    mask.simulate('click')
    expect(wrapper.state('active')).toBe(false)
  })

  it('closes on esc key press', () => {
    const wrapper = shallow(<Menu />)
    wrapper.setState({ active: true })
    const instance = wrapper.instance()
    instance.handleEscClose({ key: 'Escape' })
    wrapper.update()
    expect(wrapper.state('active')).toBe(false)
  })
  it('only listens esc key press', () => {
    const wrapper = shallow(<Menu />)
    wrapper.setState({ active: true })
    const instance = wrapper.instance()
    instance.handleEscClose({ key: 'Enter' })
    wrapper.update()
    expect(wrapper.state('active')).toBe(true)
  })

  it('handles Toggle', () => {
    const wrapper = shallow(<Menu />)
    const instance = wrapper.instance()
    instance.handleToggle()
    expect(wrapper.state('active')).toBe(true)
    instance.handleToggle()
    expect(wrapper.state('active')).toBe(false)
  })

  it('handles Signout', async () => {
    const signOutMock = promiseToResolve()
    const wrapper = shallow(<Menu signOut={signOutMock} />)
    const instance = wrapper.instance()
    await instance.handleSignOut()
    // expect(navigate).toHaveBeenCalled()
  })
})
