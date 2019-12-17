import React from 'react'
import { shallow, mount } from 'enzyme'
import WS from 'jest-websocket-mock'
import withNotifcations from '../withNotifcations'

const url = 'wss://some-url'
const SomeComponent = () => <span />

const mockNotifications = {
  pending: [
    {
      account: 'JoeSmith',
      human_timestamp: 'Mon, 18 Nov 2019 20:29:41 GMT',
      message:
        '[{"id":655,"name":"bread","price":"2","quantity":"2","author":"JoeSmith","creditor":"Person2","debitor":"JoeSmith","transaction_id":"25c1f950-0a42-11ea-b29c-59cf1afe88ac","debitor_approval_time":"2019-11-18 20:29:40.583 +00:00","unit_of_measurement":null,"units_measured":null,"rule_instance_id":null,"expiration_time":null,"debitor_profile_latlng":null,"creditor_profile_latlng":null,"debitor_transaction_latlng":null,"creditor_transaction_latlng":null,"creditor_approval_time":null,"debitor_device":null,"creditor_device":null,"debit_approver":null,"credit_approver":null,"creditor_rejection_time":null,"debitor_rejection_time":null,"createdAt":"2019-11-18T20:29:40.800Z"},{"id":656,"name":"9% state sales tax","price":"0.360","quantity":"1","author":"JoeSmith","creditor":"StateOfCalifornia","debitor":"JoeSmith","transaction_id":"25c1f950-0a42-11ea-b29c-59cf1afe88ac","rule_instance_id":"8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d","debitor_approval_time":"2019-11-18 20:29:40.583 +00:00","unit_of_measurement":null,"units_measured":null,"expiration_time":null,"debitor_profile_latlng":null,"creditor_profile_latlng":null,"debitor_transaction_latlng":null,"creditor_transaction_latlng":null,"creditor_approval_time":null,"debitor_device":null,"creditor_device":null,"debit_approver":null,"credit_approver":null,"creditor_rejection_time":null,"debitor_rejection_time":null,"createdAt":"2019-11-18T20:29:40.801Z"}]',
      timestamp: 1574108981171521,
      uuid: '261c0032-0a42-11ea-a6e1-4380e87bdc44'
    },
    {
      account: 'JoeSmith',
      human_timestamp: 'Mon, 18 Nov 2019 20:27:45 GMT',
      message:
        '[{"id":653,"name":"Milk","price":"3","quantity":"3","author":"JoeSmith","creditor":"Person2","debitor":"JoeSmith","transaction_id":"e1087000-0a41-11ea-b29c-59cf1afe88ac","debitor_approval_time":"2019-11-18 20:27:45.283 +00:00","unit_of_measurement":null,"units_measured":null,"rule_instance_id":null,"expiration_time":null,"debitor_profile_latlng":null,"creditor_profile_latlng":null,"debitor_transaction_latlng":null,"creditor_transaction_latlng":null,"creditor_approval_time":null,"debitor_device":null,"creditor_device":null,"debit_approver":null,"credit_approver":null,"creditor_rejection_time":null,"debitor_rejection_time":null,"createdAt":"2019-11-18T20:27:45.501Z"},{"id":654,"name":"9% state sales tax","price":"0.810","quantity":"1","author":"JoeSmith","creditor":"StateOfCalifornia","debitor":"Person2","transaction_id":"e1087000-0a41-11ea-b29c-59cf1afe88ac","rule_instance_id":"8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d","unit_of_measurement":null,"units_measured":null,"expiration_time":null,"debitor_profile_latlng":null,"creditor_profile_latlng":null,"debitor_transaction_latlng":null,"creditor_transaction_latlng":null,"debitor_approval_time":null,"creditor_approval_time":null,"debitor_device":null,"creditor_device":null,"debit_approver":null,"credit_approver":null,"creditor_rejection_time":null,"debitor_rejection_time":null,"createdAt":"2019-11-18T20:27:45.522Z"}]',
      timestamp: 1574108865821019,
      uuid: 'e15afcd0-0a41-11ea-a6e1-4380e87bdc44'
    }
  ]
}

const mockClearNotifications = {
  cleared: mockNotifications.pending
}

describe('withNotifications', () => {
  let wrapper
  let server

  beforeEach(async () => {
    server = new WS(url)
    const WrappedComponent = withNotifcations({ url })(SomeComponent)
    wrapper = mount(<WrappedComponent />)
    await server.connected
    await expect(server).toReceiveMessage(
      JSON.stringify({
        action: 'getnotifications',
        token: '',
        count: 20
      })
    )
    await server.send(JSON.stringify(mockNotifications))
    await wrapper.update()
  })

  afterEach(() => {
    WS.clean()
  })

  it('should receive pending notifications', async () => {
    const notifications = wrapper.find(SomeComponent).prop('notifications')
    expect(notifications).toHaveLength(mockNotifications.pending.length)
  })

  it('should clear pending notifications', async () => {
    const clearNotifications = wrapper
      .find(SomeComponent)
      .prop('clearNotifications')
    clearNotifications()
    await server.send(JSON.stringify(mockClearNotifications))
    await wrapper.update()
    const notifications = wrapper.find(SomeComponent).prop('notifications')
    expect(notifications).toHaveLength(0)
  })

  it('should request n more notifications on clear', async () => {
    const clearNotifications = wrapper
      .find(SomeComponent)
      .prop('clearNotifications')
    clearNotifications()
    await expect(server).toReceiveMessage(
      JSON.stringify({
        action: 'clearnotifications',
        token: '',
        notifications: mockNotifications.pending
      })
    )
    await server.send(JSON.stringify(mockClearNotifications))
    await expect(server).toReceiveMessage(
      JSON.stringify({
        action: 'getnotifications',
        token: '',
        count: mockClearNotifications.cleared.length
      })
    )
  })
})
