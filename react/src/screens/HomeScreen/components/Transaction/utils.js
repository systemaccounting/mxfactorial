const recalculateRules = (transactions, rules) => {
  // Return empty array of rules if there is no transactions
  if (!transactions.length) {
    return []
  }
  const newRules = rules.map(rule => ({
    ...rule,
    // Iterate over transactions array to calculate new rule price
    price: transactions
      .reduce((acc, item) => {
        switch (rule.name) {
          case '9% state sales tax':
            return acc + item.price * item.quantity * 0.09
          default:
            return 0
        }
      }, 0)
      .toFixed(3)
  }))
  // Omit rules with zero price
  return newRules.filter(item => item.price > 0)
}

export { recalculateRules }
