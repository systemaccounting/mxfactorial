import { applyRules }  from '../src/applyRules'

const transaction_items = [
    {
      name: 'Milk',
      price: '5',
      quantity: '2',
      author: 'Joe Smith',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
      name: 'Bread',
      price: '4',
      quantity: '5',
      author: 'Joe Smith',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
      name: 'Vitamins',
      price: '24',
      quantity: '1',
      author: 'Joe Smith',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
      name: 'NY Steak',
      price: '12',
      quantity: '2',
      author: 'Joe Smith',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
      name: 'Grapes',
      price: '5',
      quantity: '1',
      author: 'Joe Namath',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
  
    // {
    //   name: '9% Sales Tax',
    //   price: '7.02',
    //   quantity: '10',
    //   author: 'Joe Smith',
    //   debitor: 'Joe Smith',
    //   creditor: 'StateOfCalifornia'
    // },
    // {
    //   name: '9% Sales Tax',
    //   price: '7.02',
    //   quantity: '10',
    //   author: 'Joe Smith',
    //   debitor: 'Joe Smith',
    //   creditor: 'StateOfCalifornia'
    // },
    // {
    //   name: '9% Sales Tax',
    //   price: '7.02',
    //   quantity: '10',
    //   author: 'Joe Smith',
    //   debitor: 'Joe Smith',
    //   creditor: 'StateOfCalifornia'
    // }
]

const with_sales_tax = applyRules( transaction_items )

describe('Apply Rules should verify', () => {
    it('key values are only type String', () => {
        let isOK = true;
        let length = with_sales_tax.length
        
        for( i = 0; i < length; i++){
            if( typeof Object.keys(with_sales_tax) !== 'string'){
                isOK = false
                break
            }
        }
        expect(isOK).toBeTruthy()
    })

    it('all objects have fixed number of properties', () => {
    let length = with_sales_tax.length
    let isOK = true

    for( i = 0; i < with_sales_tax.length; i++){
        if( Object.keys(with_sales_tax[i]).length !== length ){
            isOK = false
            break
            }
    }

    expect( isOK ).toBeTruthy()
    })

    it('decimal precision is fixed to thousandths', () => {
        let isOK = true
        with_sales_tax.forEach( item => {
            if( item.price <= item.price.toFixed(3) ){
                isOK = false
            }
        })
        expect( isOK ).toBeTruthy()
    })
})