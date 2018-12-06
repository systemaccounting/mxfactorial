import React from 'react'
import { Link } from 'react-router-dom'
import { shallow } from 'enzyme'
import MobileNav from './index'

const pushMock = jest.fn()

const history = {
  push: pushMock
}

describe('<MobileNav />', () => {
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
})
