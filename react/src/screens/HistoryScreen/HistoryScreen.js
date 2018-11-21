import React, { Component, Fragment } from 'react'
import MainLayout from 'components/MainLayout'
import { Text } from 'components/Typography'

import s from './HistoryScreen.module.css'

class HistoryScreen extends Component {
  state = {
    history: []
  }

  componentDidMount() {
    this.handleFetchHistory()
  }

  handleFetchHistory = async () => {
    const history = await this.props.fetchHistory()
    this.setState({ history })
  }

  render() {
    return (
      <MainLayout>
        <Text
          variant="medium"
          fontWeight="bold"
          textAlign="center"
          style={{ color: '#efefef' }}
        >
          History
        </Text>
        <div className={s.content}>
          History Screen Goes Here
        </div>
      </MainLayout>
    )
  }
}

export default HistoryScreen
