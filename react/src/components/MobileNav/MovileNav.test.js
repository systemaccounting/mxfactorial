import React from 'react'
import { shallow } from 'enzyme'
import MobileNav, { ListItem } from './index'

const pushMock = jest.fn()

const history = {
  push: pushMock
}

describe('<MobileNav />', () => {
  it('renders', () => {
    const wrapper = shallow(<MobileNav />)
    expect(wrapper.exists()).toBeTruthy()
  })
  it('should call navigate on list item click', () => {
    const wrapper = shallow(<MobileNav history={history} />)
    const listItem1 = wrapper.find(ListItem).first()
    listItem1.simulate('click')
    expect(pushMock).toHaveBeenCalled()
    const listItem2 = wrapper.find(ListItem).at(1)
    listItem2.simulate('click')
    expect(pushMock).toHaveBeenCalled()
  })
})
