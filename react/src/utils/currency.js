export function formatCurrency(
  amount,
  decimalCount = 2,
  decimal = '.',
  thousands = ','
) {
  try {
    const decimals = isNaN(Math.abs(decimalCount)) ? 2 : decimalCount
    const value = Math.abs(Number(amount) || 0).toFixed(decimalCount)

    const negativeSign = amount < 0 ? '- ' : ''

    let i = parseInt(value).toString()
    let j = i.length > 3 ? i.length % 3 : 0

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : '') +
      i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
      (decimals
        ? decimal +
          Math.abs(value - i)
            .toFixed(decimals)
            .slice(2)
        : '')
    )
  } catch (e) {
    console.log(e)
  }
}
