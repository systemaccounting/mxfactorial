const { Client } = require('pg')


exports.handler = async (event) => {
  let client = new Client()
  await client.connect()
  let deleteAccount = `
  DELETE FROM transactions
  WHERE debitor=$1 OR creditor=$1 or author=$1;`
  let deleteOne = await client.query(deleteAccount, [event.accountOne])
  let deleteTwo = await client.query(deleteAccount, [event.accountTwo])
  let oneMessage = `Row count affected by ${deleteOne.command} command: ${deleteOne.rowCount}`
  console.log(oneMessage)
  let twoMessage = `Row count affected by ${deleteTwo.command} command: ${deleteTwo.rowCount}`
  console.log(twoMessage)
  let msg = oneMessage + ', ' + twoMessage
  await client.end()
  return msg
}