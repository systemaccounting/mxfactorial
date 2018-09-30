import React from 'react'
import { currentUserInfo } from 'lib/amplify'

export const UserContext = React.createContext()

export const UserConsumer = ({ children }) => (
  <UserContext.Consumer>
    {({ user, userLoading, signInPerformed, setUser }) =>
      children({ user, userLoading, signInPerformed, setUser })
    }
  </UserContext.Consumer>
)

export class UserProvider extends React.Component {
  state = {
    user: null,
    userLoading: true
  }

  componentDidMount() {
    this.getLoggedUser()
  }

  getLoggedUser = async cb => {
    const { user } = this.state
    if (user === null) {
      const user = await currentUserInfo()
      this.setState({ user, userLoading: false }, cb ? cb : () => {})
    }
  }

  signInPerformed = cb => {
    this.getLoggedUser(cb)
  }

  setUser = user => this.setState({ user })

  render() {
    const { user, userLoading } = this.state
    return (
      <UserContext.Provider
        value={{
          user,
          userLoading,
          signInPerformed: this.signInPerformed,
          setUser: this.setUser
        }}
      >
        {this.props.children}
      </UserContext.Provider>
    )
  }
}
