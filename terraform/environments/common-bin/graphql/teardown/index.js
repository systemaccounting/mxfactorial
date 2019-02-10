const mysql = require('mysql2')

const connection = mysql.createConnection({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: 'mxfactorial',
  connectTimeout: 30000 //serverless aurora
})

exports.handler = async (event) => {
  let deleteFakerQuery = `DELETE FROM transactions WHERE debitor = 'Faker';`
    return await connection.promise().query(deleteFakerQuery, [],
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
      // connection.destroy()
      console.log(data[0])
      return data[0]
    })
    .catch(error => {
      // connection.destroy()
      console.log('ERROR:', error)
      return error
    })
}


// https://github.com/aws/aws-sdk-js/issues/2376
// RDSDataService not available in lambda-bundled aws-sdk 2.290.0 so
// lambda using mysql2 (1mb) avoids uploading newer aws-sdk (38mb).
// wait until lambda available Libraries updates to remove mysql2 package
// const AWS = require('aws-sdk')
// exports.handler = async (event) => {
//   const rdsdataservice = new AWS.RDSDataService({apiVersion: '2018-08-01', region: 'us-east-1'})

//   const params = {
//     awsSecretStoreArn: 'rds-credentials-qa',
//     dbClusterOrInstanceArn: 'mxfactorial-qa',
//     sqlStatements: `DELETE FROM transactions WHERE debitor = 'Faker';`,
//     database: 'mxfactorial'
//   }

//   rdsdataservice.executeSql(params, (err, data) => {
//     if (err) console.log(err, err.stack)
//     else console.log(data)
//   })
// }