const mysql = require('mysql2')

const connection = mysql.createConnection({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: 'mxfactorial',
  connectTimeout: 30000 //serverless aurora
})

const AddTransactionResolver = (arg, conn) => {
  if (!arg) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }
  const transactionRecord = arg
  var returnedRecord = transactionRecord
  // conn.connect()
  console.log(transactionRecord)
  return conn.promise().query(
    `INSERT INTO transactions (` +
    `debitor,` +
    `debitor_profile_latlng,` +
    `debitor_transaction_latlng,` +
    `debitor_approval_time,` +
    `debitor_device,` +
    `creditor,` +
    `creditor_profile_latlng,` +
    `creditor_transaction_latlng,` +
    `creditor_approval_time,` +
    `creditor_device,` +
    `name,` +
    `price,` +
    `quantity,` +
    `unit_of_measurement,` +
    `units_measured,` +
    `rule_instance_id,` +
    `transaction_id,` +
    `debit_approver,` +
    `credit_approver,` +
    `author,` +
    `expiration_time,` +
    `creditor_rejection_time,` +
    `debitor_rejection_time` +
    `) VALUES (` +
    `?,?,?,?,?,?,?,?,?,?,` +
    `?,?,?,?,?,?,?,?,?,?,` +
    `?,?,?` +
    `);`,
    [
    transactionRecord.debitor,
    transactionRecord.debitor_profile_latlng,
    transactionRecord.debitor_transaction_latlng,
    transactionRecord.debitor_approval_time,
    transactionRecord.debitor_device,
    transactionRecord.creditor,
    transactionRecord.creditor_profile_latlng,
    transactionRecord.creditor_transaction_latlng,
    transactionRecord.creditor_approval_time,
    transactionRecord.creditor_device,
    transactionRecord.name,
    transactionRecord.price,
    transactionRecord.quantity,
    transactionRecord.unit_of_measurement,
    transactionRecord.units_measured,
    transactionRecord.rule_instance_id,
    transactionRecord.transaction_id,
    transactionRecord.debit_approver,
    transactionRecord.credit_approver,
    transactionRecord.author,
    transactionRecord.expiration_time,
    transactionRecord.creditor_rejection_time,
    transactionRecord.debitor_rejection_time
    ],
    (err, rows, fields) => {
      if (err) {
        console.log(err)
        return err
      }
      console.log(rows)
      return rows
    })
  .then(data => {
    // conn.destroy()
    returnedRecord.id = data[0].insertId
    console.log(data)
    console.log(returnedRecord)
    return returnedRecord
  })
  .catch(error => {
    // conn.destroy()
    console.log('ERROR:', error)
    return error
  })
}

const GetTransactionResolver = (arg, conn) => {
  if (!arg) {
    let emptyQuery = `SELECT * FROM transactions;`
    return conn.promise().query(emptyQuery, [],
      (err, rows, fields) => {
        if (err) {
          console.log(err)
          return err
        }
        console.log(rows)
        return rows
      }
    )
    .then(data => {
      // conn.destroy()
      console.log(data[0])
      return data[0]
    })
    .catch(error => {
      // conn.destroy()
      console.log('ERROR:', error)
      return error
    })
  }
  let query = `SELECT * FROM transactions WHERE id = ?;`
  return conn.promise().query(query, [arg],
    (err, rows, fields) => {
      if (err) {
        console.log(err)
        return err
      }
      console.log(rows)
      return rows
    }
  )
  .then(data => {
    // conn.destroy()
    console.log(data[0])
    return data[0]
  })
  .catch(error => {
    // conn.destroy()
    console.log('ERROR:', error)
    return error
  })
}

module.exports = {
  GetTransactionResolver,
  AddTransactionResolver,
  connection
}