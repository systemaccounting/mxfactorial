import React, { PureComponent } from 'react'

class WithWebSocket extends PureComponent {
  static subscribers = 0
  static connections = {}

  static joinOrCreateConnection = url => {
    const { CLOSING, CLOSED } = WebSocket
    const socket = WithWebSocket.connections[url]

    if (!socket || [CLOSING, CLOSED].includes(socket.readyState)) {
      console.info('Creating new connection: ', url)
      WithWebSocket.connections[url] = new WebSocket(url)
    } else {
      console.info('Using existing connection')
    }

    return WithWebSocket.connections[url]
  }

  static closeConnection = url => {
    const { socket } = WithWebSocket.connections[url]
    const { OPEN } = WebSocket
    if (socket && socket.readyState === OPEN) {
      socket.close()
      delete WithWebSocket.connections[url]
      console.info(`Websocket connection is closed: ${url}`)
    }
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    WithWebSocket.subscribers++
    this.setState({
      socket: WithWebSocket.joinOrCreateConnection(this.props.url)
    })
  }

  componentWillUnmount() {
    WithWebSocket.subscribers--
    if (!WithWebSocket.subscribers) {
      WithWebSocket.closeConnection(this.props.url)
    }
  }

  render() {
    const { socket } = this.state
    if (!socket) {
      return null
    }
    return this.props.children({ socket })
  }
}

export default function withWebsocket(url) {
  return WrappedComponent => props => (
    <WithWebSocket url={url}>
      {({ socket }) => <WrappedComponent {...props} socket={socket} />}
    </WithWebSocket>
  )
}
