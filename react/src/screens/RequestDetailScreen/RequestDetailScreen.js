import React from 'react'
import styled from 'styled-components'

import { dateString } from 'utils/date'
import MainLayout from 'components/MainLayout'
import Paper from 'components/Paper'
import { Text, Small, P } from 'components/Typography'
import Button from 'components/Button'
import Modal from 'components/Modal'
import RequestDetailHeader from './components/RequestDetailHeader'
import ApproveModal from './components/ApproveModal'
import SuccessModal from './components/SuccessModal'
import { fromNow } from 'utils/date'

const TransactionInfoParts = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0;
`

class RequestDetailScreen extends React.Component {
  state = {
    request: null,
    isCredit: false,
    errors: [],
    isApproveModalOpen: false,
    isApprovalSuccessFul: false
  }

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

  handleApprovalSuccess = () => this.setState({ isApprovalSuccessFul: true })

  showApproveModal = () => this.setState({ isApproveModalOpen: true })

  toggleApproveModal = isApproveModalOpen =>
    this.setState({ isApproveModalOpen })

  render() {
    const {
      request,
      isCredit,
      isApproveModalOpen,
      isApprovalSuccessFul
    } = this.state

    const { approveRequest } = this.props

    const expirationDate = dateString(
      request ? request.expiration_time : null,
      'dddd, MMMM D, YYYY \n @hh:mm:ss A ZZ UTC'
    )
    const total =
      request && `${isCredit ? '-' : ''}${request.price * request.quantity}`
    return (
      <MainLayout>
        <Modal
          isOpen={isApproveModalOpen}
          onModalToggle={this.toggleApproveModal}
        >
          {({ hide, isOpen }) =>
            isApprovalSuccessFul ? (
              <SuccessModal />
            ) : (
              <ApproveModal
                hide={hide}
                isOpen={isOpen}
                total={total}
                approveRequest={approveRequest}
                onApprovalSuccess={this.handleApprovalSuccess}
              />
            )
          }
        </Modal>
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
                  {total}
                </Text>
              </Paper>
              <Paper>
                <P fontWeight="bold">Time of request</P>
                <P data-id="requestTimeIndicator" textAlign="right">
                  {fromNow(
                    request.creditor_approval_time ||
                      request.debitor_approval_time
                  )}
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
              <Button onClick={this.showApproveModal} data-id="transactButton">
                Transact
              </Button>
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
                  1000
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
