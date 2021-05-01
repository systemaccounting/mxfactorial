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

module.exports = {
  stringIfNull,
  stringIfNumber,
}