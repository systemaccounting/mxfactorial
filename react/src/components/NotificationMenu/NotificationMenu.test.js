import React from 'react'
import { shallow } from 'enzyme'
import { Popper } from 'react-popper'
import NotificationMenu from './index'

describe('<NotificationMenu />', () => {
  it('displays single menu item with "No notifications yet" content if there is 0 pending notifications', () => {
    const renderTarget = ({ ref }) => <span ref={ref} />
    const component = shallow(
      <NotificationMenu renderTarget={renderTarget} notifications={[]} isOpen />
    )
    const dropdown = component
      .find(Popper)
      .dive()
      .dive()
      .dive()
    const menuItem = dropdown.find({ 'data-id': 'notificationsMenuItem' })

    expect(menuItem).toHaveLength(1)
    expect(menuItem.text()).toBe('No notifications yet')
  })
})
