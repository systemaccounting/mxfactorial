import { exec, ExecOptions } from "shelljs"
const execOpts: ExecOptions = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') }

// dump migrations/dumps/testseed.sql to reset db after each test
beforeAll(() => {
	const stdout = exec(`make -C .. dump-testseed`, execOpts).stdout
	if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout) }
})

// restore from migrations/dumps/testseed.sql to reset db after each test
afterEach(async () => {
	const stdout = exec(`make -C .. restore-testseed`, execOpts).stdout
	if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout) }
})