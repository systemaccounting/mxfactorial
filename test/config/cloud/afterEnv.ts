import { exec, ExecOptions } from "shelljs"

const execOpts: ExecOptions = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') }

// dump migrations/dumps/testseed.sql to reset db after each test
beforeAll(done => {

	process.env.SIGN_AWS_REQUESTS = "1"

	exec(`make --no-print-directory -C ../migrations resetrds ENV=dev DB=test`, execOpts, (code1, stdout1, stderr1) => {

		if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout1) }

		exec(`make --no-print-directory -C ../migrations/dumps dump-rds-testseed`, execOpts, (code2, stdout2, stderr2) => {

			if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout2) }

			done()
		})
	})
})

// restore from migrations/dumps/testseed.sql to reset db after each test
afterEach(done => {
	exec(`make --no-print-directory -C ../migrations/dumps restore-rds-testseed ENV=dev`, execOpts, (code, stdout, stderr) => {

		if (process.env.SILENCE_EXEC_LOGS != 'true') { console.log(stdout) }

		done()
	})
})
