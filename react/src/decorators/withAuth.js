import React from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
import { signIn, signOut, signUp, currentUserInfo } from 'lib/amplify'

const withAuth = methods => Component => props => {
  const { wrappedComponentRef, ...remainingProps } = props
  class WithAuth extends React.Component {
    static displayName = `WithAuth(${Component.displayName || Component.name})`
    static wrapperComponent = Component
    static propTypes = {
      wrappedComponentRef: PropTypes.func
    }

    render() {
      return (
        <Component {...methods} {...remainingProps} ref={wrappedComponentRef} />
      )
    }
  }
  const H = hoistStatics(WithAuth, Component)
  return <H />
}

export default withAuth({ currentUserInfo, signOut, signUp, signIn })
