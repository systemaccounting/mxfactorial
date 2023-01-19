import { exec, ExecOptions } from "shelljs";

// https://github.com/erikdubbelboer/node-sleep#these-calls-will-block-execution-of-all-javascript-by-halting-nodejs-event-loop
function msleep(n: number) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n: number) {
	msleep(n*1000);
}

export default function setup() {

	const execOpts: ExecOptions = { silent: (process.env.SILENCE_EXEC_LOGS === 'true') }

	exec(`make -C .. compose-up`, execOpts)

	var lineCount = "0"

	while (lineCount == "0") {

		sleep(1)

		lineCount = exec('psql "postgresql://test:test@0.0.0.0/mxfactorial" -t -c "\\dt" | wc -l | tr -d " "', { silent: true }).stdout
	}

	sleep(3)
}