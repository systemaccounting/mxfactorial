const Sequelize = require('sequelize') // added as dev dep since published in lambda layer

// create db connection outside of handler for multiple invocations
const connection = new Sequelize(
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

// https://sequelize.readthedocs.io/en/2.0/docs/models-definition/
const tableModel = (pgConn, sequelizeType, table) => {
  return pgConn.define(
    table,
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

module.exports = {
  connection,
  tableModel
}