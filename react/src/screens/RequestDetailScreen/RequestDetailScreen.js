import React from 'react'
import PropTypes from 'prop-types'

import { dateString } from 'utils/date'
import Paper from 'components/Paper'
import { Text, Small, P } from 'components/Typography'
import Button from 'components/Button'
import Modal from 'components/Modal'
import RequestDetailHeader from './components/RequestDetailHeader'
import ApproveModal from './components/ApproveModal'
import SuccessModal from './components/SuccessModal'
import { fromNow } from 'utils/date'

import s from './RequestDetailScreen.module.css'

class RequestDetailScreen extends React.Component {
  state = {
    request: null,
    isCredit: false,
    errors: [],
    isApproveModalOpen: false,
    isApprovalSuccessFul: false
  }

  handleApprovalSuccess = () => this.setState({ isApprovalSuccessFul: true })

  showApproveModal = () => this.setState({ isApproveModalOpen: true })

  toggleApproveModal = isApproveModalOpen =>
    this.setState({ isApproveModalOpen })

  get total() {
    const { requestTotal, isCredit } = this.props

    const localized = requestTotal.toLocaleString()
    return isCredit ? `- ${localized}` : localized
  }

  get requestInfo() {
    const { request } = this.state
    const {
      isRequestLoading,
      requestingAccount,
      requestTime,
      transactionId,
      ruleInstanceIds,
      requestItems
    } = this.props

    if (isRequestLoading) {
      return null
    }
    const expirationDate = dateString(
      request ? request.expiration_time : null,
      'dddd, MMMM D, YYYY \n @hh:mm:ss A ZZ UTC'
    )
    return (
      <div className={s.content}>
        <div>
          <Paper>
            <Text
              variant="large"
              textAlign="center"
              fontWeight="bold"
              data-id="requestingAccountIndicator"
            >
              {requestingAccount}
            </Text>
          </Paper>
          <Paper>
            <Text
              variant="large"
              textAlign="center"
              fontWeight="bold"
              data-id="sumTransactionItemIndicator"
            >
              {this.total}
            </Text>
          </Paper>
          <Paper>
            <P fontWeight="bold">Time of request</P>
            <P data-id="requestTimeIndicator" textAlign="right">
              {fromNow(requestTime)}
            </P>
          </Paper>
          <Paper>
            <P fontWeight="bold">Time of expiration</P>
            <P data-id="expirationTimeIndicator" textAlign="right">
              {expirationDate}
            </P>
          </Paper>
        </div>
        <div className={s.actions} data-id="request-actions">
          <Button
            onClick={this.showApproveModal}
            icon="exchange"
            data-id="transactButton"
          >
            Transact
          </Button>
          <Button theme="secondary" data-id="rejectButton">
            Reject
          </Button>
        </div>
        <div className={s.cart} data-id="transaction-items">
          {requestItems.map(item => (
            <Paper data-id="transactionItemIndicator" key={item.id}>
              <P textAlign="center" fontWeight="bold" variant="medium">
                {parseInt(item.quantity, 10)} x {item.price}
              </P>
              <P textAlign="center" fontWeight="bold" variant="medium">
                {item.name}
              </P>
            </Paper>
          ))}
        </div>
        <div data-id="transaction-ids">
          <p className={s.label}>Transaction ID</p>
          <Paper>
            <Small
              textAlign="center"
              fontWeight="bold"
              data-id="transactionIdIndicator"
            >
              {transactionId}
            </Small>
          </Paper>
          {ruleInstanceIds.length && (
            <p className={s.label}>Rule Instance IDs</p>
          )}
          {ruleInstanceIds.map(id => (
            <Paper key={id}>
              <Small
                textAlign="center"
                fontWeight="bold"
                data-id="ruleInstanceIdsIndicator"
              >
                {id}
              </Small>
            </Paper>
          ))}
          <p className={s.label}>Pre-transaction balance</p>
          <Paper>
            <Text
              textAlign="right"
              variant="medium"
              fontWeight="bold"
              data-id="preTransactionBalanceIndicator"
            >
              {/*{this.transactionBalance.toLocaleString()}*/}
            </Text>
          </Paper>
        </div>
      </div>
    )
  }

  render() {
    const { isApproveModalOpen, isApprovalSuccessFul } = this.state

    const { approveRequest } = this.props
    return (
      <>
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
                total={this.total}
                approveRequest={approveRequest}
                onApprovalSuccess={this.handleApprovalSuccess}
              />
            )
          }
        </Modal>
        <RequestDetailHeader />
        {this.requestInfo}
      </>
    )
  }
}

RequestDetailScreen.propTypes = {
  requestingAccount: PropTypes.string,
  requestTotal: PropTypes.number,
  isRequestLoading: PropTypes.bool,
  transactionId: PropTypes.string,
  ruleInstanceIds: PropTypes.arrayOf(PropTypes.string),
  requestItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      quantity: PropTypes.string,
      price: PropTypes.string
    })
  )
}

RequestDetailScreen.defaultProps = {
  requestingAccount: '',
  transactionId: '',
  ruleInstanceIds: [],
  isRequestLoading: true,
  requestItems: [],
  requestTotal: 0
}

export default RequestDetailScreen
