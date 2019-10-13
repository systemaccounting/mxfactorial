const requestRules = require('./requestRules')
const {
  itemsUnderTestArray,
  RULES_URL
} = require('../tests/utils/testData')

let post = jest.fn().mockImplementation(() => {
  return new Promise(resolve => resolve({
    data: []
  }))
})

let axios = { post }

describe('requestRules', () => {
  test('sends transaction items to rules endpoint', async () => {
    await requestRules(axios, RULES_URL, itemsUnderTestArray)
    expect(post).toHaveBeenCalledWith(RULES_URL, itemsUnderTestArray)
  })
})
