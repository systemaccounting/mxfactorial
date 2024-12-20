import url from 'url'; // cadet todo: replace with whatwg-url and add tests

export default function (uri: string): string {
	// if protocol prefix missing
	if (!uri.includes('://')) {
		// if its a websocket uri
		if (uri.includes('/ws')) {
			// add ws:// prefix
			uri = 'ws://' + uri;
		} else {
			// add http:// prefix
			uri = 'http://' + uri;
		}
	}
	const parsed = url.parse(uri);
	if (process.env.ENABLE_TLS && process.env.ENABLE_TLS === 'true') {
		if (parsed.protocol === 'http:') {
			parsed.protocol = 'https:';
		}
		if (parsed.protocol === 'ws:') {
			parsed.protocol = 'wss:';
		}
	}
	return url.format(parsed);
}