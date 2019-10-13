const itemsUnderTestArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary',
    transaction_id: '662bc1a0-ed24-11e9-90ac-fd8810fc35b7'
  }
]

const itemsStandardArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary'
  },
  {
    name: '9% state sales tax',
    quantity: '1',
    price: '0.540',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'StateOfCalifornia'
  }
]

const RULES_URL = 'https://test.url'

module.exports = {
  itemsUnderTestArray,
  itemsStandardArray,
  RULES_URL
}