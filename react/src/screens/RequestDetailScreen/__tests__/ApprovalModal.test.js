import React from 'react'
import { shallow } from 'enzyme'
import ApproveModal from '../components/ApproveModal'
import Input from 'components/Form/Input'
import { promiseToReject, promiseToResolve } from 'utils/testing'

const hideMock = jest.fn()

const props = {
  total: '1000',
  hide: hideMock
}

describe('<ApproveModal />', () => {
  it('renders', () => {
    const wrapper = shallow(<ApproveModal {...props} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('updates password on type', () => {
    const wrapper = shallow(<ApproveModal {...props} />)
    const input = wrapper.find(Input).find('[type="password"]')
    expect(input.exists()).toBeTruthy()

    input.simulate('change', {
      target: {
        value: '123'
      }
    })
    expect(wrapper.state('password')).toEqual('123')
  })

  it('dissmisses modal', () => {
    const wrapper = shallow(<ApproveModal {...props} />)
    const cancelButton = wrapper.find('[data-id="cancelButton"]')

    expect(cancelButton.exists()).toBeTruthy()

    cancelButton.simulate('click')

    expect(hideMock).toHaveBeenCalled()
  })

  it('shows error on wrong password', async () => {
    const approveMock = promiseToReject('passwordError')
    const wrapper = shallow(
      <ApproveModal {...props} approveRequest={approveMock} />
    )
    expect(wrapper.state('passwordError')).toBe(false)
    const instance = wrapper.instance()

    await instance.handleApproveRequest()
    expect(wrapper.state('passwordError')).toBe(true)
  })

  it('handles submit', () => {
    const approveMock = promiseToReject('passwordError')
    const wrapper = shallow(
      <ApproveModal {...props} approveRequest={approveMock} />
    )
    const password = 'pass'
    wrapper.setState({ password })
    const okButton = wrapper.find('[data-id="okButton"]')
    expect(okButton.exists()).toBeTruthy()
    const instance = wrapper.instance()

    const handleApproveRequestSpy = jest.spyOn(instance, 'handleApproveRequest')
    okButton.simulate('click')
    expect(handleApproveRequestSpy).toHaveBeenCalledWith(password)
  })

  it('calls callback passed on request approve success', async () => {
    const approveMock = promiseToResolve({})
    const onApproveSuccessMock = jest.fn()
    const wrapper = shallow(
      <ApproveModal
        {...props}
        approveRequest={approveMock}
        onApprovalSuccess={onApproveSuccessMock}
      />
    )
    expect(wrapper.state('passwordError')).toBe(false)
    const instance = wrapper.instance()
    await instance.handleApproveRequest()
    expect(onApproveSuccessMock).toHaveBeenCalled()
  })
})
