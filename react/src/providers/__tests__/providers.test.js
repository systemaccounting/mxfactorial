import React from 'react'
import { shallow } from 'enzyme'
import Provider from '..'

describe('<Provider />', () => {
  it('renders', () => {
    const DummyComp = () => <div>Dummy</div>
    const wrapper = shallow(
      <Provider>
        <DummyComp />
      </Provider>
    )

    expect(wrapper.exists()).toBeTruthy()
    expect(wrapper.find(DummyComp).exists()).toBeTruthy()
  })
})
