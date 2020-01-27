import { renderProps } from '../index'

const mockData = {
  loading: false,
  requestsByID: [
    {
      id: '3135',
      name: 'Milk',
      quantity: '2',
      price: '2',
      author: 'Person1',
      debitor: 'JoeSmith',
      creditor: 'Person1',
      creditor_approval_time: '2020-01-05 17:22:25.764 +00:00',
      debitor_approval_time: null,
      expiration_time: '2021-01-05 17:22:25.764 +00:00',
      transaction_id: 'f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6',
      rule_instance_id: null
    },
    {
      id: '3136',
      name: '9% state sales tax',
      quantity: '1',
      price: '0.360',
      author: 'Person1',
      debitor: 'JoeSmith',
      creditor: 'StateOfCalifornia',
      creditor_approval_time: '2020-01-05 17:22:24.544 +00:00',
      debitor_approval_time: null,
      expiration_time: '2021-01-05 17:22:25.764 +00:00',
      transaction_id: 'f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6',
      rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
    }
  ]
}

const mockOwnProps = {
  user: {
    username: 'JoeSmith'
  }
}

describe('Request detail screen render props', () => {
  it('should map render props correctly', () => {
    const props = renderProps({ data: mockData, ownProps: mockOwnProps })
    expect(props.isRequestLoading).toBe(mockData.loading)
    expect(props.isCredit).toBe(false)
    expect(props.requestingAccount).toBe('JoeSmith')
    expect(props.requestTotal).toBe(4.36)
    expect(props.transactionId).toBe('f06ed7f0-2fdf-11ea-bd38-bf40aeec34f6')
    expect(props.ruleInstanceIds).toEqual([
      '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
    ])
    expect(props.requestTime).toBe('2020-01-05 17:22:25.764 +00:00')
    expect(props.requestItems).toBe(mockData.requestsByID)
    expect(props.expirationTime).toBe('2021-01-05 17:22:25.764 +00:00')
  })
})
