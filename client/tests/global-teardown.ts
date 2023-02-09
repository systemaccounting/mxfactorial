// global-teardown.ts
import shelljs from "shelljs";

async function globalTeardown() {

	const execOpts: ExecOptions = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') };

	await shelljs.exec(`make -C .. compose-down`, execOpts)
}

export default globalTeardown;