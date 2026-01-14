export default function (uri: string, resource: string | undefined, enableTls: boolean): string {
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
	const parsed = new URL(uri);
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
	// add resource path if available
	if (resource) {
		// remove leading slashes and add one back
		parsed.pathname = '/' + resource.replace(/^\/+/, '');
		// remove trailing slashes
		parsed.pathname = parsed.pathname.replace(/\/+$/, '');
	}
	return parsed.toString();
}