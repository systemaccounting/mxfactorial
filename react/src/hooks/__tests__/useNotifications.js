import React from 'react'
import { mount } from 'enzyme'
import WS from 'jest-websocket-mock'
import useNotifications from '../useNotifications'

const server = new WS(
  process.env.REACT_APP_WSS_CLIENT_URL || 'wss://localhost:8080'
)
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

function NotificationsWrapper() {
  const [notifications] = useNotifications()
  return <span notifications={notifications} />
}

describe('useNotifications hook', () => {
  it('works', async () => {
    const component = mount(<NotificationsWrapper />)
    await server.connected
    await server.send(JSON.stringify(mockNotifications))
    component.update()
    const notifications = component.find('span').prop('notifications')
    notifications.forEach((item, idx) => {
      const mockItem = mockNotifications.pending[idx]
      expect(item.account).toBe(mockItem.account)
      expect(item.human_timestamp).toBe(mockItem.human_timestamp)
      expect(item.uuid).toBe(mockItem.uuid)
    })
  })

  it('shares state across subscribed components', async () => {
    const component1 = mount(<NotificationsWrapper />)
    const component2 = mount(<NotificationsWrapper />)

    await server.connected
    await server.send(JSON.stringify(mockNotifications))
    component1.update()
    component2.update()

    const component1Notifications = component1
      .find('span')
      .prop('notifications')
    const component2Notifications = component2
      .find('span')
      .prop('notifications')
    expect(component1Notifications).toBe(component2Notifications)
  })
})
