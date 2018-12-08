import React from 'react'
import { Link } from 'react-router-dom'
import { shallow } from 'enzyme'
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

  it("doesn't render test vars if REACT_APP_TEST_ENV is undefined", () => {
    const wrapper = shallow(<MobileNav />)
    const testItemsLength = wrapper.find('[data-id="nav-menu-test-item"]')
      .length
    expect(process.env.REACT_APP_TEST_ENV).toBeUndefined()
    expect(testItemsLength).toEqual(0)
  })

  it('renders test vars if REACT_APP_TEST_ENV is defined', () => {
    process.env.REACT_APP_TEST_ENV = 'dev'
    const wrapper = shallow(<MobileNav />)
    const testItemsLength = wrapper.find('[data-id="nav-menu-test-item"]')
      .length
    expect(testItemsLength).toEqual(1)
  })
})
