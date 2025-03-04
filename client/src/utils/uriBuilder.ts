import url from 'url'; // cadet todo: replace with whatwg-url and add tests

export default function (uri: string, enableTls: boolean): string {
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
	// tls remains enabled IF uri was passed with https:// or wss:// prefix
	// but this will override if uri was passed with http:// or ws:// prefix
	if (enableTls) {
		if (parsed.protocol === 'http:') {
			parsed.protocol = 'https:';
		}
		if (parsed.protocol === 'ws:') {
			parsed.protocol = 'wss:';
		}
	}
	return url.format(parsed);
}