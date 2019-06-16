const applyRules = require('../src/applyRules')
const uuidv1 = require('uuid/v1')
const TAX_TRANSACTION_NAME = '9% state sales tax'
jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn())

const transaction_items = [
  {
    name: 'Milk',
    price: '4.4',
    quantity: '2',
    author: 'JoeSmith',
    debitor: 'JoeSmith',
    creditor: 'Mary'
  },
  {
    name: 'Bread',
    price: '6.25',
    quantity: '5',
    author: 'JoeSmith',
    debitor: 'JoeSmith',
    creditor: 'Mary'
  },
  {
    name: 'Vitamins',
    price: '24.23',
    quantity: '1',
    author: 'JoeSmith',
    debitor: 'JoeSmith',
    creditor: 'Mary'
  },
  {
    name: 'NY Steak',
    price: '12.54',
    quantity: '2',
    author: 'JoeSmith',
    debitor: 'JoeSmith',
    creditor: 'Mary'
  },
  {
    name: 'Grapes',
    price: '5.223',
    quantity: '1',
    author: 'JoeNamath',
    debitor: 'JoeSmith',
    creditor: 'Mary'
  },
  {
    name: 'Paper Towels',
    price: '12.3348',
    quantity: '1',
    author: 'JoeNamath',
    debitor: 'JoeSmith',
    creditor: 'Mary'
  }
]

describe('Apply Rules returns', () => {
  it('identical property count for all user-generated objects', () => {
    let withSalesTax = applyRules(uuidv1(), transaction_items)
    let expectedPropertyCount = 6
    withSalesTax.forEach(item => {
      if (item.name !== TAX_TRANSACTION_NAME) {
        expect(Object.keys(item)).toHaveLength(expectedPropertyCount)
      }
    })
  })

  it('decimal precision is fixed to thousandths', () => {
    let withSalesTax = applyRules(uuidv1(), transaction_items)
    let ruleGeneratedObject = withSalesTax.filter(item => {
      return item.name === TAX_TRANSACTION_NAME
    })[0]
    expect(ruleGeneratedObject.price).toEqual('9.623')
  })

  it('+1 rule-generated object only', () => {
    let withSalesTax = applyRules(uuidv1(), transaction_items)
    let userGeneratedObjectCount = withSalesTax.filter(item => {
      return item.name !== TAX_TRANSACTION_NAME
    }).length
    expect(withSalesTax).toHaveLength(userGeneratedObjectCount + 1)
  })

  it('checks debitor name match', () => {
    let withSalesTax = applyRules(uuidv1(), transaction_items)
    for (i = 0; i < withSalesTax.length; i++) {
      expect(withSalesTax[i].debitor).toEqual('JoeSmith')
    }
  })

  it('ruleID property in rule-generated objects', () => {
    let withSalesTax = applyRules(uuidv1(), transaction_items)
    withSalesTax.forEach(item => {
      if (item.name === TAX_TRANSACTION_NAME) {
        expect(Object.keys(item)).toContain('rule_instance_id')
      }
    })
  })

  it('ruleID property excluded from user-generated objects', () => {
    let withSalesTax = applyRules(uuidv1(), transaction_items)
    let userGeneratedItems = withSalesTax.filter(item => {
      return item.name !== TAX_TRANSACTION_NAME
    })
    let userGeneratedItemsWithRuleID = userGeneratedItems.filter(item => {
      return Object.keys(item) == 'rule_instance_id'
    })
    expect(userGeneratedItemsWithRuleID).toHaveLength(0)
  })
})
