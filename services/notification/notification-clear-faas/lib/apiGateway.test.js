const {
  sendMessageToClient
} = require('./apiGateway')

afterEach(() => {
  jest.clearAllMocks()
})

const mockAws = method => {
  return {
    [method]: jest.fn().mockImplementation(() => {
      return {
        promise: jest.fn().mockImplementation(() => {
          return {
            then: jest.fn().mockImplementation(() => {
              return {
                catch: jest.fn()
              }
            })
          }
        })
      }
    })
  }
}

describe('apiGateway', () => {
  test('sendMessageToClient params', () => {
    let apig = mockAws('postToConnection')
    let connectionId = '1234567'
    let data = {
      cleared: [
        {"account":"testaccount","time_uuid":"1234","message":"test message"}
      ]
    }
    let expected = {
      ConnectionId: connectionId,
      Data: JSON.stringify(data)
    }
    sendMessageToClient(apig, connectionId, data)
    expect(apig.postToConnection).toHaveBeenCalledWith(expected)
  })
})