import React from 'react'
import { shallow } from 'enzyme'
import Modal from '.'
import { noop } from 'rxjs'

describe('<Modal />', () => {
  it('renders', () => {
    const wrapper = shallow(<Modal children={noop} />)
    expect(wrapper.exists())
  })

  it('handles show', () => {
    const onModalToggleMock = jest.fn()
    const wrapper = shallow(
      <Modal onModalToggle={onModalToggleMock} children={noop} />
    )
    const instance = wrapper.instance()
    instance.show()
    expect(wrapper.state('isOpen')).toBe(true)
    expect(onModalToggleMock).toHaveBeenCalledWith(true)
  })

  it('handles hide', () => {
    const onModalToggleMock = jest.fn()
    const wrapper = shallow(
      <Modal onModalToggle={onModalToggleMock} children={noop} />
    )
    const instance = wrapper.instance()
    instance.hide()
    expect(wrapper.state('isOpen')).toBe(false)
    expect(onModalToggleMock).toHaveBeenCalledWith(false)
  })

  it('handles toggle', () => {
    jest.useFakeTimers()
    const wrapper = shallow(<Modal isOpen={true} children={noop} />)
    const instance = wrapper.instance()
    expect(wrapper.state('isHidden')).toBe(false)
    instance.toggle()
    expect(wrapper.state('isOpen')).toBe(false)
    jest.runAllTimers()
    expect(wrapper.state('isHidden')).toBe(false)
  })

  it('handles click on modal-body-frame', () => {
    const wrapper = shallow(<Modal isOpen={true} children={noop} />)
    const modalBodyFrame = wrapper.find('[data-id="modal-body-frame"]')
    const preventDefaultMock = jest.fn()
    const stopPropagationMock = jest.fn()
    modalBodyFrame.simulate('click', {
      preventDefault: preventDefaultMock,
      stopPropagation: stopPropagationMock
    })
    expect(preventDefaultMock).toHaveBeenCalled()
    expect(stopPropagationMock).toHaveBeenCalled()
  })

  it('handles component updagte', () => {
    const wrapper = shallow(<Modal children={noop} />)
    expect(wrapper.state()).toEqual({ isOpen: false, isHidden: true })
    wrapper.setState({ isHidden: true, isOpen: true })
    const instance = wrapper.instance()
    instance.hide()
    expect(wrapper.state()).toEqual({ isOpen: false, isHidden: true })
  })
})
