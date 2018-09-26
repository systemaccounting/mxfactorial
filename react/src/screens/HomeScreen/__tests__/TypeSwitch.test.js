import React from 'react'
import { shallow } from 'enzyme'
import TypeSwitch from '../components/Transaction/TypeSwitch'

describe('<TypeSwitch />', () => {
  const onSwitchMock = jest.fn()
  it('renders', () => {
    const wrapper = shallow(<TypeSwitch onSwitch={onSwitchMock} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders buttons', () => {
    const onSwitchMock = jest.fn()
    const wrapper = shallow(<TypeSwitch onSwitch={onSwitchMock} />)
    const buttons = wrapper.dive().find('Button')
    expect(buttons).toHaveLength(2)
    const debitBtn = buttons.first()
    debitBtn.simulate('click', {
      target: {
        name: 'debit'
      }
    })

    expect(onSwitchMock).toHaveBeenCalled()
  })
})
