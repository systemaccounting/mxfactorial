import { exec, ExecOptions } from "shelljs"
import config from "../../../project.json"

const execOpts: ExecOptions = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') }

// dump migrations/dumps/testseed.sql to reset db after each test
beforeAll(done => {

	process.env.SIGN_AWS_REQUESTS = "1"

	exec(`make -C ../migrations resetrds ENV=dev DB=test`, execOpts, (code1, stdout1, stderr1) => {

		// if (stderr) { console.log(stderr1) }
		exec(`make -C ../migrations/dumps dump-rds-testseed`, execOpts, (code2, stdout2, stderr2) => {

			// if (stderr) { console.log(stderr2) }
			done()
		})
	})
})

// restore from migrations/dumps/testseed.sql to reset db after each test
afterEach(done => {
	exec(`make -C ../migrations/dumps restore-rds-testseed ENV=dev`, execOpts, (code, stdout, stderr) => {

		// if (stderr) { console.log(stderr) }
		done()
	})
})
