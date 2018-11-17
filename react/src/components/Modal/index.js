import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import is from 'styled-is'
import MainWrapper from 'components/MainWrapper'
import { noop } from 'utils'

const ANIMATION_DURATION = 300

const ModalContainer = styled.div`
  display: flex;
  flex-directon: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

const ModalWrapper = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  transition: opacity ${ANIMATION_DURATION}ms;
  ${is('isOpen')`
    opacity: 1;
  `};
  ${is('isHidden')`  
    z-index: -1;
    height:0;
    overflow: hidden;
  `};
  ${MainWrapper} {
    height: 100%;
    margin: 0 auto;
  }
  ${ModalContainer} {
    transition: ${ANIMATION_DURATION}ms;
    transform: translateY(-100%);
    ${is('isOpen')`
      transform: translateY(0);
    `};
  }
`

class Modal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    onModalToggle: PropTypes.func
  }

  static defaultProps = {
    isOpen: false,
    onModalToggle: noop
  }

  state = {
    isOpen: this.props.isOpen,
    isHidden: !this.props.isOpen
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { isOpen } = nextProps
    const { isHidden } = prevState
    if (isOpen && isHidden) {
      return { isOpen: true, isHidden: false }
    }
    return null
  }

  componentDidUpdate(_, prevState) {
    const { isOpen, isHidden } = this.state
    const updated =
      isOpen !== prevState.isOpen && isHidden !== prevState.isHidden
    if (updated && isHidden && !isOpen) {
      this.setIsHidden()
    }
  }

  toggle = () => {
    const { isOpen } = this.state
    this.setState({ isOpen: !isOpen }, () => this.toggleCallback())
  }

  show = () => this.setState({ isOpen: true }, () => this.toggleCallback())
  hide = () => this.setState({ isOpen: false }, () => this.toggleCallback())

  setIsHidden = () => {
    setTimeout(() => this.setState({ isHidden: true }), ANIMATION_DURATION)
  }

  toggleCallback = () => {
    const { isOpen } = this.state
    const { onModalToggle } = this.props
    if (!isOpen) {
      this.setIsHidden()
    }
    onModalToggle && onModalToggle(isOpen)
  }

  handleModalClick = e => {
    e.stopPropagation()
    e.preventDefault()
  }

  render() {
    const { isOpen, isHidden } = this.state
    const { toggle, show, hide } = this
    return (
      <ModalWrapper isOpen={isOpen} isHidden={isHidden} onClick={hide}>
        <ModalContainer>
          <div data-id="modal-body-frame" onClick={this.handleModalClick}>
            {this.props.children({ toggle, show, hide, isOpen })}
          </div>
        </ModalContainer>
      </ModalWrapper>
    )
  }
}
export default Modal
