const createRequest = `
  mutation CreateRequest($items: [RequestCreateInput]!) {
    createRequest(items: $items) {
      author
      debitor
      debitor_approval_time
      creditor
      creditor_approval_time
      name
      price
      quantity
      rule_instance_id
      transaction_id
      id
    }
  }
`

const approveRequest = `
  mutation approveRequest($items: [RequestApproveInput]!) {
    approveRequest(items: $items) {
      author
      debitor
      debitor_approval_time
      creditor
      creditor_approval_time
      name
      price
      quantity
      rule_instance_id
      transaction_id
      id
    }
  }
`

module.exports = {
  createRequest,
  approveRequest
}
