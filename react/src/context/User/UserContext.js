import React from 'react'

export const UserContext = React.createContext()

export const UserConsumer = ({ children }) => (
  <UserContext.Consumer>
    {({ user, userLoading }) =>
      children({
        user,
        userLoading
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
    const { singInPerform } = this.props
    this.getLoggedUser()
    singInPerform.subscribe(user => this.setState({ user }))
  }

  componentWillUnmount() {
    const { singInPerform } = this.props
    singInPerform.unsubscribe()
  }

  getLoggedUser = async () => {
    const { user } = this.state
    const { currentUserInfo } = this.props
    if (user === null) {
      const user = await currentUserInfo()
      this.setState({ user, userLoading: false })
    }
  }

  render() {
    const { user, userLoading } = this.state
    console.log(user, userLoading)
    return (
      <UserContext.Provider
        value={{
          user,
          userLoading
        }}
      >
        {this.props.children}
      </UserContext.Provider>
    )
  }
}
