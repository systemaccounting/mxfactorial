import React, { PureComponent } from 'react'
import Auth from '@aws-amplify/auth'
import withWebsocket from './withWebsocket'

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

class WithNotifications extends PureComponent {
  static notifications = []
  static listeners = []

  static addNotificationsListener = listener => {
    WithNotifications.listeners.push(listener)
  }

  static removeNotificationsListener = listener => {
    WithNotifications.listeners = WithNotifications.listeners.filter(
      item => item === listener
    )
  }

  static handleMessage = event => {
    const data = JSON.parse(event.data)
    if (data.pending) {
      const newNotifications = [
        ...WithNotifications.notifications,
        ...parseNotifications(data.pending)
      ]
      WithNotifications.notifications = newNotifications
      WithNotifications.listeners.forEach(listener =>
        listener(newNotifications)
      )
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      notifications: WithNotifications.notifications
    }
    if (!WithNotifications.listeners.length) {
      this.subscribeToNotifications()
    }
    WithNotifications.addNotificationsListener(this.onNotificationsUpdate)
  }

  componentDidMount() {
    const { socket } = this.props
    if (socket.readyState === WebSocket.OPEN) {
      this.getNotifications()
    } else if (socket.readyState === WebSocket.CONNECTING) {
      socket.addEventListener('open', this.getNotifications)
    }
  }

  componentWillUnmount() {
    const { socket } = this.props
    WithNotifications.removeNotificationsListener(this.onNotificationsUpdate)
    if (!WithNotifications.listeners.length) {
      WithNotifications.notifications = []
      socket.removeEventListener('message', WithNotifications.handleMessage)
    }
  }

  subscribeToNotifications = async () => {
    const { socket } = this.props
    if (!socket) {
      return
    }
    socket.addEventListener('message', WithNotifications.handleMessage)
  }

  getNotifications = async () => {
    const { socket } = this.props
    if (!socket) {
      return
    }
    socket.send(
      JSON.stringify({
        action: 'getnotifications',
        count: 20 - this.state.notifications.length,
        token: await getAuthToken()
      })
    )
  }

  clearNotifications = () => {
    console.log('Clear notifications')
  }

  onNotificationsUpdate = notifications => this.setState({ notifications })

  render() {
    return this.props.children({
      notifications: this.state.notifications,
      clearNotifications: this.clearNotifications
    })
  }
}

export default function withNotifications({ url } = {}) {
  const NotificationsWithSocket = withWebsocket(url)(WithNotifications)

  return WrappedComponent => props => (
    <NotificationsWithSocket>
      {({ notifications, clearNotifications }) => (
        <WrappedComponent
          {...props}
          notifications={notifications}
          clearNotifications={clearNotifications}
        />
      )}
    </NotificationsWithSocket>
  )
}
