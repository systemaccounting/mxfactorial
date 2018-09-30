import React from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
import { UserConsumer } from 'context/User/UserContext'

const withUser = methods => Component => props => {
  const { wrappedComponentRef, ...remainingProps } = props
  class WithUser extends React.Component {
    static displayName = `WithAuth(${Component.displayName || Component.name})`
    static wrapperComponent = Component
    static propTypes = {
      wrappedComponentRef: PropTypes.func
    }

    render() {
      return (
        <UserConsumer>
          {({ ...userProps }) => (
            <Component
              {...methods}
              {...remainingProps}
              {...userProps}
              ref={wrappedComponentRef}
            />
          )}
        </UserConsumer>
      )
    }
  }
  const H = hoistStatics(WithUser, Component)
  return <H />
}

export default withUser({})
