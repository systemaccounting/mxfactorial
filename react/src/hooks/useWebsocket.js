import { useEffect, useState } from 'react'

const connections = {}

function joinOrCreateConnection(url) {
  let { socket } = connections[url] || {}
  const { CLOSING, CLOSED } = WebSocket

  if (!socket || [CLOSING, CLOSED].includes(socket.readyState)) {
    console.log('Creating new connection: ', url)
    connections[url] = {
      socket: new WebSocket(url),
      subscribers: 0
    }
  } else {
    console.info('Using existing connection')
  }

  connections[url].subscribers++
  return connections[url]
}

export default function useWebsocket(
  url = process.env.REACT_APP_WSS_CLIENT_URL
) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const connection = joinOrCreateConnection(url)
    setSocket(connection.socket)

    const closeConnection = () => {
      connection.subscribers--
      // Close connection if there is no subscribers
      if (
        !connection.subscribers &&
        connection.socket.readyState === WebSocket.OPEN
      ) {
        connection.socket.close()
        console.info(`Websocket connection is closed: ${url}`)
      }
    }
    return closeConnection
  }, [url])

  return [socket]
}
