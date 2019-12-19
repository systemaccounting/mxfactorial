const Sequelize = require('sequelize') // added as dev dep since published in lambda layer

// https://sequelize.readthedocs.io/en/2.0/docs/models-definition/
const notificationWebsocketsModel = (sequelize, sequelizeType) => {
  return sequelize.define(
    'notification_websockets',
    {
      id: {
        type: sequelizeType.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      connection_id: sequelizeType.STRING,
      created_at: sequelizeType.DATE,
      epoch_created_at: sequelizeType.BIGINT,
      account: sequelizeType.STRING
    },
    {
      timestamps: false
    }
  )
}

// create db connection outside of handler for multiple invocations
const pgConnection = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    operatorAliases: false,
    logging: console.log,
    port: process.env.PGPORT,
    dialect: 'postgres',
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000
    }
  }
)

exports.handler = async event => {
  console.log(JSON.stringify(event))

  if (!event.requestContext.connectedAt) {
    throw Error('empty connectedAt')
  }

  let connectedAt = event.requestContext.connectedAt

  if (!event.requestContext.connectionId) {
    throw Error('empty connectionId')
  }

  let connectionId = event.requestContext.connectionId

  let notificationWebsocketsTable = notificationWebsocketsModel(
    pgConnection,
    Sequelize
  )

  // store connection id in postgres
  if (event.requestContext.eventType === "CONNECT") {

    let insertResult = await notificationWebsocketsTable.create({
        connection_id: connectionId,
        created_at: null,
        epoch_created_at: connectedAt,
        account: null
      })

    console.log(insertResult)

  // or delete connection id item if disconnecting web websocket
  } else if (event.requestContext.eventType === "DISCONNECT") {

    let deleteResult = await notificationWebsocketsTable.destroy({
        where: {
          connection_id: connectionId
        }
      })

      console.log(deleteResult)

  } else {
    throw new Error('unmatched eventType')
  }

  // leave connection available across multiple lambda invocations
  // pgConnection.close().then(() => console.log('postgres connection closed'))

  // return success to api gateway
  return {
    statusCode: 200
  }
  
}