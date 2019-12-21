import React from 'react'
import { shallow, mount } from 'enzyme'
import { BrowserRouter } from 'react-router-dom'

import PrivateRoutes from '../index'

describe('<PrivateRoutes />', () => {
  it('renders', () => {
    const wrapper = shallow(
      <BrowserRouter>
        <PrivateRoutes />
      </BrowserRouter>
    )
    expect(wrapper.find(PrivateRoutes)).toHaveLength(1)
  })
})
