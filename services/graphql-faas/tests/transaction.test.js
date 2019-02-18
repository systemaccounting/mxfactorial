const request = require('supertest')
const { tearDownIntegrationTestDataInRDS } = require('./utils/tearDown')
const { REQUEST_URL } = require('./utils/baseUrl')

afterAll(() => {
  tearDownIntegrationTestDataInRDS()
})

const mutation = `mutation createTransaction {
  createTransaction(input: {
    debitor: "Faker",
    debitor_profile_latlng: "51.2244, -12.12221",
    debitor_transaction_latlng: "00.0000, -00.00000",
    debitor_approval_time: "2018-10-26T21:32:52",
    debitor_device: "Mozilla/5.0 (Windows; U; Win98; en-US; rv:0.9.2) Gecko/20010725 Netscape6/6.1",
    creditor: "Mary",
    creditor_profile_latlng: "11.1111, -11.11111",
    creditor_transaction_latlng: "22.222, -22.22222",
    creditor_approval_time: "2018-09-30T04:05:32.505Z",
    creditor_device: "iPhone 8 Plus",
    name: "Milk",
    price: "3",
    quantity: "2",
    unit_of_measurement: "gallons",
    units_measured: "1",
    rule_instance_id: "94aaa930-c46a-11e8-bb14-dbb770b4bd9c",
    transaction_id: "857a4ae0-c467-11e8-b1ae-3be7f4f4e50a",
    debit_approver: "John",
    credit_approver: "Mary",
    author: "John",
    expiration_time: "2019-09-30T04:17:19.340Z"
  }) {
    id
    debitor
    creditor
    name
    price
    quantity
  }
}`

var transactionID
jest.setTimeout(30000) // lambda and serverless aurora cold starts

describe('Function As A Service GraphQL Server', () => {

  it('sends transaction mutation', (done) => {
    return request(REQUEST_URL)
      .post('/')
      .set('Content-Type', 'application/graphql')
      .set('Accept', 'application/json')
      .send(mutation)
      .then(res => {
        // console.log(res.body.data)
        const transaction = res.body.data.createTransaction
        transactionID = transaction.id
        expect(transaction.creditor).toBe(`Mary`)
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('responds with transaction ID', (done) => {
    var query = `{
      transactions(transactionId: "${transactionID}") {
        id
      }
    }`
    return request(REQUEST_URL)
      .post('/')
      .set('Content-Type', 'application/graphql')
      .set('Accept', 'application/json')
      .send(query)
      .then(res => {
        // console.log(res.body.data.transactions[0])
        expect(res.body.data.transactions[0].id).toBe(transactionID)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
