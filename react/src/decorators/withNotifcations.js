import React, { PureComponent, createRef } from 'react'
import Auth from '@aws-amplify/auth'
import Websocket from 'react-websocket'

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

export default function withNotifications({ url }) {
  return WrappedComponent => {
    return class extends PureComponent {
      socketRef = createRef()

      state = {
        notifications: []
      }

      getNotifications = async count => {
        const socket = this.socketRef.current
        if (!socket) {
          return
        }
        socket.sendMessage(
          JSON.stringify({
            action: 'getnotifications',
            token: await getAuthToken(),
            count
          })
        )
      }

      onOpen = () => {
        const count = 20 - this.state.notifications.length
        this.getNotifications(count)
      }

      onMessage = message => {
        const data = JSON.parse(message)
        // Received notifications
        if (data.pending) {
          this.setState(prevState => ({
            notifications: [...prevState.notifications, ...data.pending]
          }))
        }
        if (data.cleared) {
          const clearedIds = data.cleared.map(item => item.uuid)
          this.setState(
            prevState => ({
              notifications: prevState.notifications.filter(
                item => !clearedIds.includes(item.uuid)
              )
            }),
            // Request n more notifcations
            () => this.getNotifications(data.cleared.length)
          )
        }
      }

      clearNotifications = async () => {
        const socket = this.socketRef.current
        const { notifications } = this.state
        console.log(socket)
        if (!socket) {
          return
        }
        socket.sendMessage(
          JSON.stringify({
            action: 'clearnotifications',
            token: await getAuthToken(),
            notifications
          })
        )
      }

      render() {
        const { notifications } = this.state
        return (
          <>
            <WrappedComponent
              notifications={parseNotifications(notifications)}
              clearNotifications={this.clearNotifications}
              {...this.props}
            />
            <Websocket
              url={url}
              onOpen={this.onOpen}
              onMessage={this.onMessage}
              ref={this.socketRef}
            />
          </>
        )
      }
    }
  }
}
