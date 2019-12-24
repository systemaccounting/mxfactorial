import React from 'react'
import { shallow } from 'enzyme'
import { Popper } from 'react-popper'
import { fromNow } from 'utils/date'
import NotificationMenu from './index'
import mockNotifications from './mockNotifications'

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

  it('should display menu item with request time, requesting account, magnitude and direction of transaction', () => {
    const renderTarget = ({ ref }) => <span ref={ref} />
    const component = shallow(
      <NotificationMenu
        renderTarget={renderTarget}
        notifications={mockNotifications}
        isOpen
      />
    )
    const dropdown = component
      .find(Popper)
      .dive()
      .dive()
      .dive()
    const menuItem = dropdown.find({ 'data-id': 'notificationsMenuItem' })

    mockNotifications.forEach((item, idx) => {
      const menuItemText = menuItem.at(idx).text()
      expect(menuItemText).toMatch(item.contraAccount)
      expect(menuItemText).toMatch(`${item.totalPrice}`)
      expect(menuItemText).toMatch(fromNow(item.human_timestamp))
    })
  })

  it('should close dropdown menu on clear btn click', () => {
    const onClose = jest.fn()
    const onClear = jest.fn()

    const renderTarget = ({ ref }) => <span ref={ref} />
    const component = shallow(
      <NotificationMenu
        renderTarget={renderTarget}
        notifications={mockNotifications}
        onClose={onClose}
        onClear={onClear}
        isOpen
      />
    )

    const dropdown = component
      .find(Popper)
      .dive()
      .dive()
      .dive()
    const clearBtn = dropdown.find({ 'data-id': 'notificationsClear' })
    clearBtn.simulate('click')

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
