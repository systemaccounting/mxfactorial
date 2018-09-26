import React from 'react'
import styled from 'styled-components'

import MainLayout from 'components/MainLayout'
import TypeSwitch from './components/TypeSwitch'
import Paper from 'components/Paper'
import { Text, Small } from 'components/Typography'
import { fromNow } from 'utils/date'
import { asyncPipe } from 'utils'

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
    asyncPipe(this.handleGetUserInfo, this.handleFetchRequests)
  }

  handleGetUserInfo = async () => {
    const { currentUserInfo } = this.props
    const user = await currentUserInfo()
    this.setState({ user })
  }

  handleFetchRequests = async () => {
    const { active, rejected } = await this.props.fetchRequests()
    this.setState({ requests: { active, rejected } })
  }

  handleSwitch = status => () => this.setState({ status })

  render() {
    const { status, requests, user } = this.state
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
              <Paper key={request.timeuuid} data-id="requestItemIndicator">
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
            )
          })}
        </Wrapper>
      </MainLayout>
    )
  }
}

export default RequestScreen
