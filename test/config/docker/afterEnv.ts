import { exec, ExecOptions } from "shelljs"
import config from "../../../project.json"

const execOpts: ExecOptions = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') }

// dump migrations/dumps/testseed.sql to reset db after each test
beforeAll(() => {
	const stdout = exec(`make -C .. dump-testseed`, execOpts).stdout

	if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout) }

	process.env.GRAPHQL_URI = config.env_var.GRAPHQL_URI.docker
	process.env.RULES_URL = config.env_var.RULES_URL.docker
	process.env.REQUEST_CREATE_URL = config.env_var.REQUEST_CREATE_URL.docker
	process.env.REQUEST_APPROVE_URL = config.env_var.REQUEST_APPROVE_URL.docker
	process.env.TRANSACTION_BY_ID_URL = config.env_var.TRANSACTION_BY_ID_URL.docker
	process.env.TRANSACTIONS_BY_ACCOUNT_URL = config.env_var.TRANSACTIONS_BY_ACCOUNT_URL.docker
	process.env.REQUEST_BY_ID_URL = config.env_var.REQUEST_BY_ID_URL.docker
	process.env.REQUESTS_BY_ACCOUNT_URL = config.env_var.REQUESTS_BY_ACCOUNT_URL.docker
	process.env.BALANCE_BY_ACCOUNT_URL = config.env_var.BALANCE_BY_ACCOUNT_URL.docker
})

// restore from migrations/dumps/testseed.sql to reset db after each test
afterEach(async () => {
	const stdout = exec(`make -C .. restore-testseed`, execOpts).stdout
	if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout) }
})