const FIXED_DECIMAL_PLACES= 3;

function stringIfNull(v) {
  if (v == null) {
    return ""
  }
  return v
}

function stringIfNumber(v) {
  if (typeof v == 'number') {
    return v.toString()
  }
  return v
}

function numberToFixedString(num) {
  return num.toFixed(FIXED_DECIMAL_PLACES).toString()
}

module.exports = {
  stringIfNull,
  stringIfNumber,
  numberToFixedString
}