import createDecorator from 'final-form-calculate'

export const createCalculator = ({ username } = {}) =>
  createDecorator({
    field: ['type', 'recipient'], // when type or recipient changes
    updates: {
      // ...update items' values
      items: (value, { type, recipient, items }) =>
        items.map(item => {
          return {
            ...item,
            author: username,
            debitor: type === 'credit' ? recipient : username,
            creditor: type === 'debit' ? recipient : username
          }
        })
    }
  })
