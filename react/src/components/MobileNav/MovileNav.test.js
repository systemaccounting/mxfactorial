import React from 'react'
import { Link } from 'react-router-dom'
import { shallow } from 'enzyme'
import { getTestVars, noop } from 'utils'

import MobileNav from './index'

const pushMock = jest.fn()

const history = {
  push: pushMock
}

describe('<MobileNav />', () => {
  let initialEnvVar

  it('renders', () => {
    const wrapper = shallow(<MobileNav />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('has correct links', () => {
    const wrapper = shallow(<MobileNav />)
    const links = wrapper.find(Link)
    const requestsLink = links.first()
    const historyLink = links.at(1)
    expect(requestsLink.prop('to')).toEqual('/requests')
    expect(historyLink.prop('to')).toEqual('/history')
  })

  it("doesn't render test vars if REACT_APP_HOST_ENV is undefined", () => {
    const wrapper = shallow(<MobileNav />)
    const testItemsLength = wrapper.find('[data-id="nav-menu-test-item"]')
      .length
    expect(process.env.REACT_APP_HOST_ENV).toBeUndefined()
    expect(testItemsLength).toEqual(0)
  })

  it('renders test vars if REACT_APP_HOST_ENV is defined', () => {
    process.env.REACT_APP_HOST_ENV = 'dev'
    const wrapper = shallow(<MobileNav />)
    const testItemsLength = wrapper.find('[data-id="nav-menu-test-item"]')
      .length
    expect(testItemsLength).toEqual(getTestVars().length)
  })

  it('should close menu on menu item click', () => {
    const onCloseMock = jest.fn()
    const wrapper = shallow(<MobileNav onClose={onCloseMock} />)
    const menuItems = wrapper.find({ 'data-id': 'nav-menu-item' })
    menuItems.forEach(item => item.simulate('click'))
    expect(onCloseMock).toHaveBeenCalledTimes(menuItems.length)
  })
})
