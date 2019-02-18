const getTransaction = (id, conn) => {
  if (!id) {
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
  return conn.promise().query(query, [id],
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
  getTransaction
}