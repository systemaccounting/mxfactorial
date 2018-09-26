import { setValues } from '../schema'

const schema = {
  id: 'name',
  label: 'next',
  properties: {
    name: {
      type: 'string',
      inputType: 'text',
      name: 'name',
      placeholder: 'Item',
      value: '',
      required: true
    },
    price: {
      type: 'string',
      inputType: 'text',
      name: 'price',
      placeholder: 'Price',
      value: '',
      required: true
    },
    quantity: {
      type: 'string',
      inputType: 'text',
      name: 'quantity',
      placeholder: 'Quantity',
      value: '',
      required: true
    }
  }
}

describe('setValues()', () => {
  it('should fill schema with given values', () => {
    const values = {
      name: 'name',
      price: 'price',
      quantity: 'quantity'
    }
    const schemaSet = setValues(schema)(values)
    expect(schemaSet.properties.name.value).toEqual('name')
    expect(schemaSet.properties.price.value).toEqual('price')
    expect(schemaSet.properties.quantity.value).toEqual('quantity')
  })
})
