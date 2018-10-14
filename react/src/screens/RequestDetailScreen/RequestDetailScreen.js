import React from 'react'

import MainLayout from 'components/MainLayout'
import RequestHeader from './components/RequestHeader'

class RequestDetailScreen extends React.Component {
  state = { request: null, errors: [] }

  componentDidMount() {
    const { fetchRequest } = this.props
    const { match } = this.props
    fetchRequest(match.params.uuid)
      .then(request => {
        if (request !== {}) {
          this.setState({ request })
        } else {
          this.setErrors(null, 'Request not found')
        }
      })
      .catch(error => this.setErrors(error, 'Request not found'))
  }

  setErrors = (error, message) =>
    this.setState(state => ({
      errors: [...state.errors, { message, error }]
    }))

  render() {
    const { request } = this.state
    return (
      <MainLayout>
        <RequestHeader />
        <div>Request Detail </div>
      </MainLayout>
    )
  }
}

export default RequestDetailScreen
