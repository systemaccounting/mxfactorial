import { useEffect, useState } from 'react'
import Auth from '@aws-amplify/auth'
import useWebsocket from './useWebsocket'

const state = {
  pending: [],
  isSubscribed: false
}

const listeners = []

const requestNotifications = async socket => {
  if (!socket) {
    return
  }
  const session = await Auth.currentSession()
  const token = session.getIdToken().getJwtToken()

  socket.send(
    JSON.stringify({
      action: 'getnotifications',
      token
    })
  )
}

const onMessage = ({ data }) => {
  const notifications = JSON.parse(data)
  state.pending = notifications.pending
  listeners.forEach(listener => listener(state.pending))
}

export default function useNotifications() {
  const socketUrl = process.env.REACT_APP_WSS_CLIENT_URL
  const [notifications, setNotifications] = useState(state.pending)
  const [socket] = useWebsocket(socketUrl, 'notifications')

  useEffect(() => {
    if (!socket) {
      return
    }

    const listener = newNotifications => {
      setNotifications(newNotifications)
    }

    listeners.push(listener)

    // Subscribe to notifications update only once
    if (!state.isSubscribed) {
      console.log('Subscribe count: ', listeners.length)
      state.isSubscribed = true

      if (socket.readyState === WebSocket.OPEN) {
        requestNotifications(socket)
      } else if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => requestNotifications(socket))
      }

      socket.addEventListener('message', onMessage)
    }

    const removeListeners = () => {
      const listenerIdx = listeners.indexOf(listener)
      listeners.splice(listenerIdx, 1)
      if (!listeners.length) {
        state.isSubscribed = false
        console.log(
          'There are no more notification listeners. Unsubscribing....'
        )
        socket.removeEventListener('message', onMessage)
      }
    }
    return removeListeners
  }, [socket])

  return [notifications]
}
