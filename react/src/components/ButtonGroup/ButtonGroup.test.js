import React from 'react'
import { shallow } from 'enzyme'

import ButtonGroup from './index'

describe('<ButtonGroup />', () => {
  it('renders', () => {
    const onUpdateMock = jest.fn()
    const wrapper = shallow(
      <ButtonGroup>
        {({ handleSelect, active }) => (
          <React.Fragment>
            <button name="test" onClick={handleSelect}>
              test
            </button>
            <button name="test2" onClick={handleSelect}>
              test2
            </button>
          </React.Fragment>
        )}
      </ButtonGroup>
    )

    expect(wrapper.exists()).toBeTruthy()

    const buttonFirst = wrapper
      .dive()
      .find('button')
      .first()
    buttonFirst.simulate('click', {
      target: {
        name: 'test'
      }
    })
    expect(wrapper.state('active')).toEqual('test')

    wrapper.setProps({ onUpdate: onUpdateMock })
    wrapper.update()
    wrapper
      .dive()
      .find('button')
      .last()
    buttonFirst.simulate('click', {
      target: {
        name: 'test2'
      }
    })
    expect(wrapper.state('active')).toEqual('test2')
    expect(onUpdateMock).toHaveBeenCalledWith('test2')
  })
})
