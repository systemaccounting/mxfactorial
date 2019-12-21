import React from 'react'
import { shallow } from 'enzyme'
import { Route } from 'react-router-dom'
import PrivateRoutes from 'screens/private'
import PublicRoutes from 'screens/public'
import { App } from '../App'

describe('<App />', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<App />)
    expect(wrapper.exists()).toBeTruthy()
  })

  it('renders loading if user loading', () => {
    const wrapper = shallow(<App user={null} userLoading />)
    expect(wrapper.text()).toMatch('Loading...')
  })

  it('doesnt render loading if user loaded', () => {
    const wrapper = shallow(
      <App user={{ username: 'test' }} userLoading={false} />
    )
    expect(wrapper.text()).not.toMatch('Loading...')
  })

  it('renders private routes if user loaded', () => {
    const wrapper = shallow(
      <App user={{ username: 'test' }} userLoading={false} />
    )
    const routesMapping = {
      '/auth': PublicRoutes,
      '/': PrivateRoutes
    }
    wrapper.find(Route).forEach(item => {
      const routePath = item.prop('path')
      expect(item.prop('component')).toBe(routesMapping[routePath])
    })
  })

  it('renders public routes if user does not exist', () => {
    const wrapper = shallow(<App user={null} userLoading={false} />)
    expect(wrapper.find(PrivateRoutes)).toHaveLength(0)
    expect(wrapper.find(PublicRoutes)).toHaveLength(1)
  })
})
