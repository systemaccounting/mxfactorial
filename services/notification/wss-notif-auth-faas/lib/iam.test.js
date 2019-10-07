const authorize = require('./iam')

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.unmock('./iam')
})

describe('authorize', () => {
  test('returns allow iam policy', () => {
    let RESOURCE = 'testarn'
    let ACCOUNT = 'testaccount'
    let expected = {
      principalId: 'LambdaAuthorizer',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: RESOURCE
        }]
      },
      context: {
        account: ACCOUNT
      }
    }
    let result = authorize(RESOURCE, ACCOUNT)
    expect(result).toEqual(expected)
  })
})