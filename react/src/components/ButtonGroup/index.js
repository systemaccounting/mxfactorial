import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  justify-content: center;
  button {
    font-weight: 400;
    border-radius: 0;
    width: 120px;
    height: 48px;
    &:first-child {
      border-radius: 3px 0 0 3px;
    }
    &:last-child {
      border-radius: 0 3px 3px 0;
    }
  }
`
class ButtonGroup extends React.Component {
  state = {
    active: this.props.active
  }

  handleSelect = e => {
    const { onUpdate } = this.props
    const { name } = e.target
    this.setState({ active: name }, () => (onUpdate ? onUpdate(name) : null))
  }

  render() {
    return (
      <Container>
        {typeof this.props.children === 'function'
          ? this.props.children({
              handleSelect: this.handleSelect,
              active: this.state.active
            })
          : this.props.children}
      </Container>
    )
  }
}

export default ButtonGroup
