import express, { Application, Request, Response } from 'express';
import testRequest from "./handlers/testRequest";
import applyRules from "./handlers/applyRules";

const app: Application = express();

app.use(express.json());

app.get(process.env['READINESS_CHECK_PATH'], function(req: Request, res: Response) {
	res.sendStatus(200);
});

app.post("/", testRequest, applyRules);

export default app