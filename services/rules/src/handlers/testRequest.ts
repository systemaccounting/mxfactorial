import { Request, Response, NextFunction } from 'express';

export default function testRequest(req: Request, res: Response, next: NextFunction) {
	if (!Array.isArray(req.body)) {
		console.log("body is not array:", req.body)
		res.sendStatus(400)
		return
	}

	if (req.body == null || !Object.keys(req.body).length) {
		console.log('0 items received...');
		res.sendStatus(400)
		return
	}

	next()
}