exports.handler = async (event) => {
  // distinguish between request from graphql (external)
  // and transactions service (internal)
  if (event.internal) {
    let internalResponse = {}
    internalResponse.message = `'` + event.message + `' message received`
    console.log(internalResponse)
    return internalResponse
  }
}