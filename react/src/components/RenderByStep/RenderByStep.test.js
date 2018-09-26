import React from 'react'
import { shallow } from 'enzyme'

import RenderByStep from './'

describe('<RenderByStep />', () => {
  it('renders', () => {
    const DummyChildren = () => <div>Dummy</div>
    const wrapper = shallow(
      <RenderByStep>
        <DummyChildren />
      </RenderByStep>
    )

    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders by step', () => {
    const DummyChild1 = () => <div>Dummy1</div>
    const DummyChild2 = () => <div>Dummy2</div>
    const wrapper = shallow(
      <RenderByStep step={1}>
        <DummyChild1 />
        <DummyChild2 />
      </RenderByStep>
    )
    expect(wrapper.find(DummyChild1).exists()).toBeFalsy()
  })
})
