const path = require('path')
const child_process = require('child_process')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const Umzug = require('umzug')
const Sequelize = require('sequelize')
const mysql = require('mysql2/promise')
const fs = require('fs')
const writeFile = util.promisify(fs.writeFile)

const DB_NAME = 'mxfactorial'
const DB_USERNAME = process.env.USER
const DB_PASSWORD = process.env.PASSWORD
const DB_HOST = process.env.HOST
const WRITABLE_LAMBDA_PATH = '/tmp'
const ZIP_FILENAME = 'diffs.zip'
const UNZIPPED_DIFFS_DIR = 'unzipped-diffs'

exports.handler = async (event) => {
  if (!event.command) {
    console.log(`No schema change command received`)
    return `Please supply schema change command, e.g. up, down`
  }
  const cmd = event.command
  const zipFile = new Buffer(event.zip, 'base64')
  // const base64DecodedZipWithClonedDiffs = Buffer.from(event.zip, 'base64')
  // add arn:aws:lambda:<region>:744348701589:layer:bash:5 layer published
  // from https://github.com/gkrizek/bash-lambda-layer before invoking.
  // configure 30s timeout on lambda
  await exec(`rm -rf ${WRITABLE_LAMBDA_PATH}/*`)
  await writeFile(`${WRITABLE_LAMBDA_PATH}/${ZIP_FILENAME}`, zipFile)
  await exec(`cd ${WRITABLE_LAMBDA_PATH} && unzip ${ZIP_FILENAME} -d ${UNZIPPED_DIFFS_DIR}`)
  const outputFromls = await exec(`ls ${WRITABLE_LAMBDA_PATH}/${UNZIPPED_DIFFS_DIR}`)
  const formatted = outputFromls.stdout.replace('\n', ' ').slice(0, -1)
  console.log(formatted)

  await mysql.createConnection(
    {
      host: DB_HOST,
      user: DB_USERNAME,
      password: DB_PASSWORD
    }
  ).then(connection => {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME};`)
  })

  const sequelizeConfig = {
    host: DB_HOST,
    logging: console.log,
    port: 3306,
    dialect: 'mysql',
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000,
      handleDisconnects: true
    }
  }

  const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, sequelizeConfig)

  // arguments to sequelize configuration params
  const migration = sequelize.getQueryInterface()
  const dataTypes = sequelize.constructor
  const errCb = () => {
    throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.')
  }

  const storageOptions = { sequelize }

  // https://github.com/abelnation/sequelize-migration-hello/blob/01-initial/migrate.js
  const umzugConfiguration = {
    storage: 'sequelize',
    storageOptions,
    logging: false,
    upName: 'up',
    downName: 'down',
    migrations: {
      params: [migration, dataTypes, errCb],
      // write permitted in /tmp on lambda
      // path after clone in /tmp
      path: `${WRITABLE_LAMBDA_PATH}/${UNZIPPED_DIFFS_DIR}`,
      pattern: /\.js$/
    }
  }

  const umzug = new Umzug(umzugConfiguration)

  const logUmzugEvent = eventName => {
    return (name, migration) => {
        console.log(`${ name } ${ eventName }`)
    }
  }

  umzug.on('migrating', logUmzugEvent('migrating'))
  umzug.on('migrated',  logUmzugEvent('migrated'))
  umzug.on('reverting', logUmzugEvent('reverting'))
  umzug.on('reverted',  logUmzugEvent('reverted'))

  const cmdStatus = () => {
    let result = {}

    return umzug.executed()
      .then(executed => {
        result.executed = executed
        return umzug.pending()
    }).then(pending => {
        result.pending = pending
        return result
    }).then(({ executed, pending }) => {

        executed = executed.map(m => {
          m.name = path.basename(m.file, '.js')
          return m
        })
        pending = pending.map(m => {
          m.name = path.basename(m.file, '.js')
          return m
        })

        const current = executed.length > 0 ? executed[0].file : '<NO_MIGRATIONS>'
        const status = {
          current: current,
          executed: executed.map(m => m.file),
          pending: pending.map(m => m.file),
        }

        console.log(JSON.stringify(status, null, 2))

        return { executed, pending }
    })
  }

  const cmdMigrate = () => {
    return umzug.up()
  }

  const cmdMigrateNext = () => {
    return cmdStatus()
      .then(({ executed, pending }) => {
        if (pending.length === 0) {
          return Promise.reject(new Error('No pending migrations'))
        }
        const next = pending[0].name
        return umzug.up({ to: next })
      })
  }

  const cmdReset = () => {
    return umzug.down({ to: 0 })
  }

  const cmdResetPrev = () => {
    return cmdStatus()
      .then(({ executed, pending }) => {
        if (executed.length === 0) {
          return Promise.reject(new Error('Already at initial state'))
        }
        const prev = executed[executed.length - 1].name
        return umzug.down({ to: prev })
      })
  }

  const cmdHardReset = () => {
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          console.log(`dropdb ${ DB_NAME }`)
          child_process.spawnSync(`dropdb ${ DB_NAME }`)
          console.log(`createdb ${ DB_NAME } --username ${ DB_USERNAME }`)
          child_process.spawnSync(`createdb ${ DB_NAME } --username ${ DB_USERNAME }`)
          resolve()
        } catch (e) {
          console.log(e)
          reject(e)
        }
      })
    })
  }

  let executedCmd

  console.log(`${ cmd.toUpperCase() } BEGIN`)
  switch(cmd) {
    case 'status':
      executedCmd = cmdStatus()
      break

    case 'up':
    case 'migrate':
      executedCmd = cmdMigrate()
      break

    case 'next':
    case 'migrate-next':
      executedCmd = cmdMigrateNext()
      break

    case 'down':
    case 'reset':
      executedCmd = cmdReset()
      break

    case 'prev':
    case 'reset-prev':
      executedCmd = cmdResetPrev()
      break

    case 'reset-hard':
      executedCmd = cmdHardReset()
      break

    default:
      console.log(`invalid cmd: ${ cmd }`)
      process.exit(1)
  }

  return executedCmd
    .then(result => {
        const doneStr = `${ cmd.toUpperCase() } DONE`
        console.log(doneStr)
        console.log("=".repeat(doneStr.length))
        return doneStr
    })
    .catch(err => {
        const errorStr = `${ cmd.toUpperCase() } ERROR`
        console.log(errorStr)
        console.log("=".repeat(errorStr.length))
        console.log(err);
        console.log("=".repeat(errorStr.length))
        return errorStr
    })
    .then(() => {
        if (cmd !== 'status' && cmd !== 'reset-hard') {
            return cmdStatus()
        }
        return Promise.resolve()
    })
    // .then(() => process.exit(0))
}