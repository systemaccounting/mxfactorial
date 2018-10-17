import React from 'react'
import styled from 'styled-components'

import { dateString } from 'utils/date'
import MainLayout from 'components/MainLayout'
import Paper from 'components/Paper'
import { Text, Small, P } from 'components/Typography'
import Button from 'components/Button'
import RequestDetailHeader from './components/RequestDetailHeader'

const TransactionInfoParts = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0;
`

class RequestDetailScreen extends React.Component {
  state = { request: null, isCredit: false, errors: [] }

  componentDidMount() {
    this.handleFetchRequest()
  }

  handleFetchRequest = () => {
    const { fetchRequest, user } = this.props
    const { match } = this.props
    return fetchRequest(match.params.uuid)
      .then(request => {
        this.setState({
          request,
          isCredit: request.creditor === user.username
        })
      })
      .catch(error => this.setErrors(error, 'Request not found'))
  }

  setErrors = (error, message) =>
    this.setState(state => ({
      errors: [...state.errors, { message, error }]
    }))

  render() {
    const { request, isCredit } = this.state
    const expirationDate = dateString(
      request ? request.expiration_time : null,
      'dddd, MMMM D, YYYY \n @hh:mm:ss A ZZ UTC'
    )
    return (
      <MainLayout>
        <RequestDetailHeader />
        {request && (
          <React.Fragment>
            <TransactionInfoParts>
              <Paper>
                <Text
                  variant="medium"
                  textAlign="center"
                  data-id="requestingAccountIndicator"
                >
                  {isCredit ? request.debitor : request.creditor}
                </Text>
              </Paper>
              <Paper>
                <Text
                  variant="medium"
                  textAlign="center"
                  data-id="sumTransactionItemIndicator"
                >
                  {isCredit ? '-' : ''} {request.price * request.quantity}
                </Text>
              </Paper>
              <Paper>
                <P fontWeight="bold">Time of request</P>
                <P data-id="requestTimeIndicator" textAlign="right">
                  Time of request?
                </P>
              </Paper>
              <Paper>
                <P fontWeight="bold">Time of expire</P>
                <P data-id="expirationTimeIndicator" textAlign="right">
                  {expirationDate}
                </P>
              </Paper>
            </TransactionInfoParts>
            <TransactionInfoParts data-id="request-actions">
              <Button data-id="transactButton">Transact</Button>
              <Button data-id="rejectButton" theme="secondary">
                Reject
              </Button>
            </TransactionInfoParts>
            <TransactionInfoParts data-id="transaction-items">
              <Paper data-id="transactionItemIndicator">
                <P textAlign="center" fontWeight="bold" variant="medium">
                  {parseInt(request.quantity, 10)} x {request.price}
                </P>
                <P textAlign="center" fontWeight="bold" variant="medium">
                  {request.name}
                </P>
              </Paper>
            </TransactionInfoParts>
            <TransactionInfoParts data-id="transaction-ids">
              <Text fontWeight="bold">Transaction ID</Text>
              <Paper>
                <Small
                  textAlign="right"
                  fontWeight="bold"
                  data-id="transactionIdIndicator"
                >
                  {request.transaction_id}
                </Small>
              </Paper>
              <Text fontWeight="bold">Rule Instance ID</Text>
              <Paper>
                <Small
                  textAlign="right"
                  fontWeight="bold"
                  data-id="ruleInstanceIdsIndicator"
                >
                  {request.rule_instance_id}
                </Small>
              </Paper>
              <Text fontWeight="bold">Pre-transaction balance</Text>
              <Paper>
                <Text
                  textAlign="right"
                  fontWeight="bold"
                  data-id="preTransactionBalanceIndicator"
                >
                  pre-transaction-balance?
                </Text>
              </Paper>
            </TransactionInfoParts>
          </React.Fragment>
        )}
      </MainLayout>
    )
  }
}

export default RequestDetailScreen
