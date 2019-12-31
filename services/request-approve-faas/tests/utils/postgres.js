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
const tableModel = (pgConn, table, sequelizeType) => {
  return pgConn.define(
    table,
    {
      id: {
        type: sequelizeType.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: sequelizeType.STRING,
      price: sequelizeType.STRING,
      quantity: sequelizeType.STRING,
      author: sequelizeType.STRING,
      creditor: sequelizeType.STRING,
      debitor: sequelizeType.STRING,
      debitor_approval_time: sequelizeType.DATE,
      creditor_approval_time: sequelizeType.DATE,
      transaction_id: sequelizeType.STRING,
      rule_instance_id: sequelizeType.STRING
    },
    {
      timestamps: 0,
      plain: true
    }
  )
}

module.exports = {
  connection,
  tableModel
}