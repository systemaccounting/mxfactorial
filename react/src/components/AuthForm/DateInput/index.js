import React from 'react'
import Input from '../Input'

class DateInput extends React.PureComponent {
  state = {
    type: 'text'
  }
  handleFocus = () => {
    this.setState({ type: 'date' })
  }

  handleBlur = () => {
    this.setState({ type: 'text' })
  }

  render() {
    return (
      <Input
        {...this.props}
        type={this.state.type}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />
    )
  }
}

export default DateInput
