import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import MainLayout from 'components/MainLayout'
import TypeSwitch from './components/TypeSwitch'
import Paper from 'components/Paper'
import { Text, Small } from 'components/Typography'
import { fromNow } from 'utils/date'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

class RequestScreen extends React.Component {
  state = {
    user: null,
    requests: {
      active: [],
      rejected: []
    },
    status: 'active'
  }

  componentDidMount() {
    this.handleFetchRequests()
  }

  handleFetchRequests = async () => {
    const { active, rejected } = await this.props.fetchRequests()
    this.setState({ requests: { active, rejected } })
  }

  handleSwitch = status => () => this.setState({ status })

  render() {
    const { status, requests } = this.state
    const { user } = this.props
    const requestList =
      status === 'active' ? requests.active : requests.rejected
    return (
      <MainLayout>
        <Wrapper data-id="request-screen-wrapper">
          <TypeSwitch active={status} onSwitch={this.handleSwitch} />
          {requestList.map(request => {
            const isCredit = request.creditor === user.username
            const amount = request.price * request.quantity
            return (
              <Link key={request.timeuuid} to={`requests/${request.timeuuid}`}>
                <Paper data-id="requestItemIndicator">
                  <Small>
                    {fromNow(request.expiration_time)}
                    {', '}
                    {isCredit ? (
                      <span>
                        <strong>{request.debitor}</strong> recieved your request
                        of
                      </span>
                    ) : (
                      <span>
                        <strong>{request.creditor}</strong> requested
                      </span>
                    )}
                  </Small>
                  <Text textAlign="right" variant="medium">
                    <strong>
                      {isCredit ? '-' : ''} {amount}
                    </strong>
                  </Text>
                </Paper>
              </Link>
            )
          })}
        </Wrapper>
      </MainLayout>
    )
  }
}

export default RequestScreen
