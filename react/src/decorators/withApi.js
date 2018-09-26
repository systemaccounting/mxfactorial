import React from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
import { fetchTransactions, fetchBalance, fetchRequests } from 'mock/api'

const withApi = methods => Component => props => {
  const { wrappedComponentRef, ...remainingProps } = props
  class WithApi extends React.Component {
    static displayName = `withApi(${Component.displayName || Component.name})`
    static wrapperComponent = Component
    static propTypes = {
      wrappedComponentRef: PropTypes.func
    }

    render() {
      return (
        <Component {...methods} {...remainingProps} ref={wrappedComponentRef} />
      )
    }
  }
  const H = hoistStatics(WithApi, Component)
  return <H />
}

export default withApi({ fetchTransactions, fetchBalance, fetchRequests })
