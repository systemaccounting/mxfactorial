const schema = {
  id: 'transaction',
  label: 'Item',
  properties: {
    name: {
      type: 'string',
      inputType: 'text',
      name: 'name',
      placeholder: 'Item',
      value: ''
    },
    price: {
      type: 'string',
      inputType: 'text',
      name: 'price',
      placeholder: 'Price',
      value: ''
    },
    quantity: {
      type: 'string',
      inputType: 'text',
      name: 'quantity',
      placeholder: 'Quantity',
      value: ''
    }
  }
}

export default schema
