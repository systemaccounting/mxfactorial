const applyRules  =  require('../src/applyRules') 
const uuidv1 = require('uuid/v1')
const TAX_TRANSACTION_NAME = '9% state sales tax'

const transaction_items = [
    {
      name: 'Milk',
      price: '4.43',
      quantity: '2',
      author: 'Joe Smith',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
      name: 'Bread',
      price: '6.25',
      quantity: '5',
      author: 'Joe Smith',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
      name: 'Vitamins',
      price: '24.23',
      quantity: '1',
      author: 'Joe Smith',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
      name: 'NY Steak',
      price: '12.54',
      quantity: '2',
      author: 'Joe Smith',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
      name: 'Grapes',
      price: '5.223',
      quantity: '1',
      author: 'Joe Namath',
      debitor: 'Joe Smith',
      creditor: 'Mary'
    },
    {
    name: 'Paper Towels',
    price: '12.3348',
    quantity: '1',
    author: 'Joe Namath',
    debitor: 'Joe Smith',
    creditor: 'Mary',
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

const with_sales_tax = applyRules( uuidv1(), transaction_items )

describe('Apply Rules should verify', () => {

    it('all non-rule objects have fixed number of properties', () => {
        let length = Object.keys(with_sales_tax[0]).length
        
        with_sales_tax.forEach( item => { 
            if(item.name !== TAX_TRANSACTION_NAME){
                expect(Object.keys(item).length).toEqual(length)
            } 
        })
    })

    it('decimal precision is fixed to thousandths', () => {
        let isOK = false
        console.log(with_sales_tax)
        with_sales_tax.forEach( item => {
            if( item.name == TAX_TRANSACTION_NAME ){
                expect( item.price ).toEqual( parseFloat(item.price).toFixed(3) )
            }
        })
    })
    
    it('checks debitor name match', () => {
        let items = with_sales_tax.filter( item => {
            return item.name !== TAX_TRANSACTION_NAME
        });
        
        for(i = 0; i < items.length; i++){
            expect(items[i].author ).toEqual(transaction_items[i].author);
        }
    });

    it('checks rule generated object has rule ID', () => {
        with_sales_tax.forEach( item => {
            if(item.name === TAX_TRANSACTION_NAME){
                expect(Object.keys(item)).toContain('rule_instance_id')
            }
        })
    })
})