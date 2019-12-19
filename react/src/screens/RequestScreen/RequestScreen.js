import React from 'react'
import T from 'prop-types'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import TypeSwitch from './components/TypeSwitch'
import Paper from 'components/Paper'
import { Text, Small } from 'components/Typography'

import { fromNow } from 'utils/date'
import { TransactionType } from 'types'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export default class RequestScreen extends React.Component {
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
    const { status } = this.state
    const { user, groupedTransactions } = this.props
    return (
      <Wrapper data-id="request-screen-wrapper">
        <TypeSwitch active={status} onSwitch={this.handleSwitch} />
        {groupedTransactions.map(request => {
          let isCurrentAccountAuthor = request.author === user.username
          return (
            <Link
              key={request.transaction_id}
              to={`requests/${request.transaction_id}`}
            >
              <Paper
                data-id="requestItemIndicator"
                data-request-id={request.transaction_id}
              >
                <Small>
                  {isCurrentAccountAuthor ? (
                    <span>
                      sent <strong>{request.contraAccount}</strong> a request{' '}
                    </span>
                  ) : (
                    <span>
                      received <strong>{request.contraAccount}</strong> request{' '}
                    </span>
                  )}
                  {fromNow(request.time)}
                </Small>
                <Text textAlign="right" variant="medium">
                  <strong>
                    {request.isCreditor ? '' : '-'} {request.total}
                  </strong>
                </Text>
              </Paper>
            </Link>
          )
        })}
      </Wrapper>
    )
  }
}

RequestScreen.propTypes = {
  transactions: T.arrayOf(TransactionType)
}

RequestScreen.defaultProps = {
  transactions: []
}
