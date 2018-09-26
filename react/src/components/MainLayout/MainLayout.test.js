import React from 'react'
import { shallow } from 'enzyme'

import MainLayout from './index'
import NavigationContainer from 'containers/NavigationContainer'

describe('<MainLayout />', () => {
  it('renders', () => {
    const wrapper = shallow(<MainLayout />)
    expect(wrapper.exists()).toBeTruthy()
  })
  it('renders children and navigation', () => {
    const DummyChildren = () => <div>Dummy Children</div>
    const wrapper = shallow(
      <MainLayout>
        <DummyChildren />
      </MainLayout>
    )
    expect(wrapper.exists()).toBeTruthy()
    expect(wrapper.find(DummyChildren).exists()).toBeTruthy()
    expect(wrapper.find(NavigationContainer).exists()).toBeTruthy()
  })
})
