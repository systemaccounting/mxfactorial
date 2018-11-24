import React, { Component } from 'react'
import MainLayout from 'components/MainLayout'
import HistoryDetailHeader from './components/HistoryDetailHeader'

import s from './HistoryDetailScreen.module.css'

class HistoryDetailScreen extends Component {
  state = {
    transaction: null
  }

  componentDidMount() {
    this.handleFetchHistoryItem()
  }

  handleFetchHistoryItem = async () => {
    const {
      fetchHistoryItem,
      match: { uuid }
    } = this.props
    if (fetchHistoryItem) {
      const transaction = await fetchHistoryItem(uuid)
      this.setState({ transaction })
    }
  }

  get content() {
    return (
      <div className={s.content}>
        <p>Content</p>
      </div>
    )
  }

  render() {
    return (
      <MainLayout>
        <HistoryDetailHeader />
        {this.content}
      </MainLayout>
    )
  }
}

export default HistoryDetailScreen
