import { useEffect } from 'react'
import WebSocket from 'ws'

const connections = {}

export default function useWebsocket(url) {
  useEffect(() => {
    if (!connections[url]) {
      connections[url] = new WebSocket(url)
    }
  })

  const wsInstance = connections[url]
}
