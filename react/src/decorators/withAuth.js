import React from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'

import { signIn, signOut, signUp, currentUserInfo } from 'lib/amplify'
import { UserConsumer } from 'context/User/UserContext'

const withAuth = methods => Component => props => {
  const { wrappedComponentRef, ...remainingProps } = props
  class WithAuth extends React.Component {
    static displayName = `WithAuth(${Component.displayName || Component.name})`
    static wrapperComponent = Component
    static propTypes = {
      wrappedComponentRef: PropTypes.func
    }

    signIn = updateUser => credentials => {
      const { account, password } = credentials
      const { signIn: signInAmplify, currentUserInfo } = methods
      return signInAmplify(account, password)
        .then(async () => {
          const user = await currentUserInfo()
          updateUser(user, false)
        })
        .catch(error => console.log(error))
    }

    signOut = updateUser => () => {
      const { signOut: signOutAmplify } = methods
      return signOutAmplify()
        .then(async () => {
          updateUser(null, true)
        })
        .catch(error => console.log(error))
    }

    render() {
      const { currentUserInfo, signUp } = methods
      return (
        <UserConsumer>
          {({ updateUser }) => (
            <Component
              signIn={this.signIn(updateUser)}
              signOut={this.signOut(updateUser)}
              signUp={signUp}
              currentUserInfo={currentUserInfo}
              {...remainingProps}
              ref={wrappedComponentRef}
            />
          )}
        </UserConsumer>
      )
    }
  }
  const H = hoistStatics(WithAuth, Component)
  return <H />
}

export default withAuth({ currentUserInfo, signOut, signUp, signIn })
