import { exec, ExecOptions } from "shelljs";

const execOpts: ExecOptions = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') };

export default function teardown() {
	exec(`make -C ../.. compose-down`, execOpts, (error, stdout, stderr) => {
		if (error) { throw error }
	})
}