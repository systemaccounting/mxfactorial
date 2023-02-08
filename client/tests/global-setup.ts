// global-setup.ts
import shelljs from "shelljs";

function msleep(n: number) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n: number) {
	msleep(n*1000);
}

async function globalSetup() {

	const execOpts = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') }

	shelljs.exec(`make -C .. compose-up`, execOpts)

	let lineCount = "0"

	while (lineCount == "0") {

		sleep(1)

		lineCount = shelljs.exec('psql "postgresql://test:test@0.0.0.0/mxfactorial" -t -c "\\dt" | wc -l | tr -d " "', { silent: true }).stdout
	}

	sleep(3)

  shelljs.exec(`make -C .. rebuild-db`, execOpts)

  sleep(2)
}

export default globalSetup;

