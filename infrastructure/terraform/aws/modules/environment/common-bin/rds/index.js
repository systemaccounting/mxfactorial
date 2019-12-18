const { Client } = require('pg')


exports.handler = async (event) => {
  let client = new Client()
  await client.connect()
  let res = await client.query("DELETE FROM transactions WHERE debitor = $1;", ['Faker'])
  await client.end()
  let msg = `Row count affected by ${res.command} command: ${res.rowCount}`
  console.log(msg)
  return msg
}