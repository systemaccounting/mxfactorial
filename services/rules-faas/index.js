exports.handler = async (event) => {
  let response = {}
  response.message = `'` + event.message + `' message received`
  console.log(response)
  return response
}