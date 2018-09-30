import React from 'react'
import { navigate, Router } from '@reach/router'

import withUser from 'decorators/withUser'
import HomeScreen from '../HomeScreen'
import RequestScreen from '../RequestScreen'

const Default = () => <div>Default</div>

class PrivateRoutes extends React.Component {
  state = {
    userLoading: false,
    user: null
  }

  static getDerivedStateFromProps(nextProps) {
    const { userLoading, user } = nextProps
    return { user, userLoading }
  }

  componentDidUpdate() {
    const { userLoading, user } = this.props
    if (!userLoading && user === null) {
      return navigate('/auth')
    } else {
      return navigate('/account')
    }
  }

  renderRoutes = () => {
    return (
      <React.Fragment>
        <HomeScreen path="/account" />
        {/* <RequestScreen path="requests" /> */}
      </React.Fragment>
    )
  }

  render() {
    const { user, userLoading } = this.state
    console.log(this.props.children)
    if (user && !userLoading) {
      return (
        <div>
          <p>Private</p>
          {this.props.children({ user })}
        </div>
      )
    } else if (userLoading) {
      return 'Loading...'
    }
    return null
  }
}

export default withUser(PrivateRoutes)
