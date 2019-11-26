import { useEffect, useState, useCallback } from 'react'
import Auth from '@aws-amplify/auth'
import useWebsocket from './useWebsocket'
import { update } from 'ramda'

const state = {
  pending: [],
  isSubscribed: false
}

const listeners = []

const getAuthToken = async () => {
  try {
    const session = await Auth.currentSession()
    return session.getIdToken().getJwtToken()
  } catch (e) {
    return ''
  }
}

const parseNotifications = notifications => {
  return notifications.map(item => {
    const message = JSON.parse(item.message)

    const transactions = message.filter(obj => !obj.rule_instance_id)
    const isCreditor = transactions[0].author === item.account
    const contraAccount = isCreditor
      ? transactions[0].debitor
      : transactions[0].creditor
    const totalPrice = message.reduce(
      (sum, obj) => parseFloat(obj.price) * parseInt(obj.quantity, 10) + sum,
      0
    )

    return {
      ...item,
      contraAccount,
      totalPrice: isCreditor ? totalPrice : totalPrice * -1,
      message
    }
  })
}

const updateNotifications = notifications => {
  state.pending = notifications || []
  listeners.forEach(listener => listener(state.pending))
}

const onMessageReceived = event => {
  const data = JSON.parse(event.data)
  if (data.pending) {
    const newNotifications = [
      ...state.pending,
      ...parseNotifications(data.pending)
    ]
    updateNotifications(newNotifications)
  }
  if (data.cleared) {
    updateNotifications([])
  }
}

const clearNotifications = async socket => {
  if (!socket) {
    return
  }
  if (!state.pending.length) {
    return
  }
  socket.send(
    JSON.stringify({
      action: 'clearnotifications',
      notifications: state.pending,
      token: await getAuthToken()
    })
  )
}

const getNotifications = async socket => {
  if (!socket) {
    return
  }
  socket.send(
    JSON.stringify({
      action: 'getnotifications',
      token: await getAuthToken()
    })
  )
  socket.addEventListener('message', onMessageReceived)
}

export default function useNotifications() {
  const socketUrl = process.env.REACT_APP_WSS_CLIENT_URL
  const [notifications, setNotifications] = useState(state.pending)
  const [socket] = useWebsocket(socketUrl, 'notifications')

  const clear = useCallback(() => clearNotifications(socket), [socket])

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
      state.isSubscribed = true

      if (socket.readyState === WebSocket.OPEN) {
        getNotifications(socket)
      } else if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => getNotifications(socket))
      }
    }

    const removeListeners = () => {
      const listenerIdx = listeners.indexOf(listener)
      listeners.splice(listenerIdx, 1)
      if (!listeners.length) {
        state.isSubscribed = false
        state.pending = []
        console.log(
          'There are no more notification listeners. Unsubscribing....'
        )
        socket.removeEventListener('message', onMessageReceived)
      }
    }
    return removeListeners
  }, [socket])

  return [notifications, clear]
}
