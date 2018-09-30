import React from 'react'
import { currentUserInfo } from 'lib/amplify'

export const UserContext = React.createContext()

export const UserConsumer = ({ children }) => (
  <UserContext.Consumer>
    {({ user, userLoading, signInPerformed, signOutPerformed, setUser }) =>
      children({
        user,
        userLoading,
        signInPerformed,
        signOutPerformed,
        setUser
      })
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
      this.setState({ user, userLoading: false }, () => {
        cb && cb()
      })
    }
  }

  signOutPerformed = cb => this.setState({ user: null }, cb ? cb() : () => {})

  signInPerformed = cb => {
    return this.getLoggedUser(cb)
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
          signOutPerformed: this.signOutPerformed,
          setUser: this.setUser
        }}
      >
        {this.props.children}
      </UserContext.Provider>
    )
  }
}
