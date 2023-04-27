import { exec, ExecOptions } from "shelljs"
import fs from "fs"
import yaml from "yaml"

const path = "../project.yaml"
const file = fs.readFileSync(path, 'utf8')
const conf = yaml.parse(file)
const envVar = conf.infrastructure.terraform.aws.modules.environment.env_var.set
const execOpts: ExecOptions = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') }

// dump migrations/dumps/testseed.sql to reset db after each test
beforeAll(() => {
	const stdout = exec(`make -C .. dump-testseed`, execOpts).stdout

	if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout) }

	process.env.GRAPHQL_URI = envVar.GRAPHQL_URI.default
	process.env.RULE_URL = envVar.RULE_URL.default
	process.env.REQUEST_CREATE_URL = envVar.REQUEST_CREATE_URL.default
	process.env.REQUEST_APPROVE_URL = envVar.REQUEST_APPROVE_URL.default
	process.env.TRANSACTION_BY_ID_URL = envVar.TRANSACTION_BY_ID_URL.default
	process.env.TRANSACTIONS_BY_ACCOUNT_URL = envVar.TRANSACTIONS_BY_ACCOUNT_URL.default
	process.env.REQUEST_BY_ID_URL = envVar.REQUEST_BY_ID_URL.default
	process.env.REQUESTS_BY_ACCOUNT_URL = envVar.REQUESTS_BY_ACCOUNT_URL.default
	process.env.BALANCE_BY_ACCOUNT_URL = envVar.BALANCE_BY_ACCOUNT_URL.default
})

// restore from migrations/dumps/testseed.sql to reset db after each test
afterEach(async () => {
	const stdout = exec(`make -C .. restore-testseed`, execOpts).stdout
	if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout) }
})