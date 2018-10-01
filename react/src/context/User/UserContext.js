import React from 'react'
import { currentUserInfo } from 'lib/amplify'

export const UserContext = React.createContext()

export const UserConsumer = ({ children }) => (
  <UserContext.Consumer>
    {({ user, userLoading, updateUser }) =>
      children({
        user,
        userLoading,
        updateUser
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

  updateUser = (user, userLoading) => this.setState({ user, userLoading })

  render() {
    const { user, userLoading } = this.state
    return (
      <UserContext.Provider
        value={{
          user,
          userLoading,
          updateUser: this.updateUser
        }}
      >
        {this.props.children}
      </UserContext.Provider>
    )
  }
}
