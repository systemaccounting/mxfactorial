import React from 'react'
import { shallow, mount } from 'enzyme'
import RequestDetailScreen from '../RequestDetailScreen'
import { promiseToResolve, promiseToReject } from 'utils/testing'
import Modal from 'components/Modal'
import ApproveModal from '../components/ApproveModal'
import SuccessModal from '../components/SuccessModal'
import { fromNow } from 'utils/date'

const props = {
  match: { params: { uuid: '1234' } },
  user: { username: 'JoeSmith' }
}

describe('<RequestDetailScreen />', () => {
  it('renders', () => {
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={() => Promise.resolve()} {...props} />
    )
    expect(wrapper.exists())
  })

  it('renders approve modal', () => {
    const requestMock = { timeuuid: 'x', creditor: 'JoeSmith' }
    const fetchRequestMock = promiseToResolve(requestMock)
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={fetchRequestMock} {...props} />
    )
    const modal = wrapper.find(Modal)
    expect(modal.exists()).toBeTruthy()

    const approveModal = modal.dive().find(ApproveModal)
    expect(approveModal.exists()).toBe(true)
  })

  it('renders success modal', () => {
    const requestMock = { timeuuid: 'x', creditor: 'JoeSmith' }
    const fetchRequestMock = promiseToResolve(requestMock)
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={fetchRequestMock} {...props} />
    )

    wrapper.setState({ isApprovalSuccessFul: true })
    const modal = wrapper.find(Modal)
    expect(modal.exists()).toBeTruthy()

    const approveModal = modal.dive().find(ApproveModal)
    expect(approveModal.exists()).toBe(false)
    const successModal = modal.dive().find(SuccessModal)
    expect(successModal.exists()).toBe(true)
  })

  it('handles approve', () => {
    const requestMock = { timeuuid: 'x', creditor: 'JoeSmith' }
    const fetchRequestMock = promiseToResolve(requestMock)
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={fetchRequestMock} {...props} />
    )
    const instance = wrapper.instance()
    expect(wrapper.state('isApprovalSuccessFul')).toBe(false)
    instance.handleApprovalSuccess()
    expect(wrapper.state('isApprovalSuccessFul')).toBe(true)
  })

  it('handles show/toggle approval modal', () => {
    const requestMock = { timeuuid: 'x', creditor: 'JoeSmith' }
    const fetchRequestMock = promiseToResolve(requestMock)
    const wrapper = shallow(
      <RequestDetailScreen fetchRequest={fetchRequestMock} {...props} />
    )
    const instance = wrapper.instance()
    expect(wrapper.state('isApproveModalOpen')).toBe(false)
    instance.showApproveModal()
    expect(wrapper.state('isApproveModalOpen')).toBe(true)
    instance.toggleApproveModal(false)
    expect(wrapper.state('isApproveModalOpen')).toBe(false)
  })

  it('displays debit/credit request values', () => {
    const mockProps = {
      isRequestLoading: false,
      transactionId: 'f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6',
      ruleInstanceIds: ['8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'],
      requestingAccount: 'Person1',
      requestTotal: 4.36,
      requestTime: '2020-01-05 17:22:25.764 +00:00',
      requestItems: [
        {
          id: '3135',
          name: 'Milk',
          quantity: '2',
          price: '2',
          author: 'Person1',
          debitor: 'JoeSmith',
          creditor: 'Person1',
          creditor_approval_time: '2020-01-05 17:22:25.764 +00:00',
          transaction_id: 'f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6'
        },
        {
          id: '3136',
          name: '9% state sales tax',
          quantity: '1',
          price: '0.360',
          author: 'Person1',
          debitor: 'JoeSmith',
          creditor: 'StateOfCalifornia',
          creditor_approval_time: '2020-01-05 17:22:24.544 +00:00',
          transaction_id: 'f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6',
          rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
        }
      ]
    }
    const wrapper = shallow(<RequestDetailScreen {...mockProps} />)

    const requestingAccount = wrapper.find({
      'data-id': 'requestingAccountIndicator'
    })
    const sumTransaction = wrapper.find({
      'data-id': 'sumTransactionItemIndicator'
    })
    const requestTime = wrapper.find({
      'data-id': 'requestTimeIndicator'
    })
    const requestItems = wrapper.find({
      'data-id': 'transactionItemIndicator'
    })
    const transactionId = wrapper.find({
      'data-id': 'transactionIdIndicator'
    })
    const ruleIds = wrapper.find({
      'data-id': 'ruleInstanceIdsIndicator'
    })

    expect(requestingAccount.html()).toMatch(mockProps.requestingAccount)
    expect(sumTransaction.html()).toMatch(mockProps.requestTotal.toString())
    expect(requestTime.html()).toMatch(fromNow(mockProps.requestTime))
    expect(transactionId.html()).toMatch(mockProps.transactionId)
    ruleIds.forEach((item, idx) => {
      expect(item.html()).toMatch(mockProps.ruleInstanceIds[idx])
    })
    requestItems.forEach((item, idx) => {
      expect(item.html()).toMatch(mockProps.requestItems[idx].name)
    })
  })
})
