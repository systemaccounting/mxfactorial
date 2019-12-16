import React, { PureComponent } from 'react'

export class WithWebsocket extends PureComponent {
	static subscribers = 0;
	static connections = {};

	static joinOrCreateConnection = url => {
		const { CLOSING, CLOSED } = WebSocket
		let { socket } = WithWebsocket.connections[url]

		if (!socket || [CLOSING, CLOSED].includes(socket.readyState)) {
			console.log('Creating new connection: ', url)
			WithWebsocket.connections[url] = socket
		} else {
			console.info('Using existing connection')
		}

		WithWebsocket.subscribers += 1
		return WithWebsocket.connections[url]
	};

	static closeConnection = url => {
		const { socket } = WithWebsocket.connections[url];
		const { OPEN } = WebSocket
		if (socket && socket.readyState === OPEN) {
			socket.close()
			console.info(`Websocket connection is closed: ${url}`)
		}
	};

	constructor(props) {
		super(props);
		this.state = {
			socket: WithWebsocket.joinOrCreateConnection(props.url),
		};
	}

	componentWillUnmount() {
		WithWebsocket.subscribers -= 1;
		if (!WithWebsocket.subscribers) {
			WithWebsocket.closeConnection(this.props.url)
		}
	}

	render() {
		const { socket } = this.state;
		return this.props.children({ socket })
	}
}

export default function withWebsocket(url) {
	return WrappedComponent => {
		return (<WithWebsocket url={url}>{({ socket }) => <WrappedComponent socket={socket} />}</WithWebsocket>)
	}
}
