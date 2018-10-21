import React from 'react'
import styled from 'styled-components'
import is from 'styled-is'
import { Flex } from '@rebass/grid'

import Input from 'components/Form/Input'
import Button from 'components/Button'
import Spacer from 'components/Spacer'
import Label from 'components/Label'

const ApproveModalStyled = styled.div`
  border-radius: 10px;
  background-color: #d9d2e9;
  width: 100%;
  max-width: 20rem;
  padding: 16px;
`

export class ApproveModal extends React.Component {
  state = {
    password: '',
    passwordError: false
  }

  updatePassword = e => {
    const { value: password } = e.target
    this.setState({ password, passwordError: false })
  }

  submit = () => {
    const { password } = this.state

    this.handleApproveRequest(password)
  }

  handleApproveRequest = password => {
    const { approveRequest, onApprovalSuccess } = this.props
    return approveRequest(password)
      .then(result => {
        if (result) {
          onApprovalSuccess()
        }
      })
      .catch(() => this.setState({ passwordError: true }))
  }

  render() {
    const { hide, total } = this.props
    const { passwordError } = this.state
    return (
      <ApproveModalStyled>
        <div>
          <Input disabled={true} defaultValue={total} />
          <Label
            data-id="requestApporovePasswordLabel"
            hasError={passwordError}
          >
            {passwordError ? 'Wrong Password' : 'Enter Password'}
          </Label>
          <Input
            hasError={passwordError}
            placeholder="Password"
            type="password"
            onChange={this.updatePassword}
          />
        </div>
        <Flex justifyContent="space-between">
          <Button data-id="cancelButton" theme="secondary" onClick={hide}>
            Cancel
          </Button>
          <Spacer w={10} />
          <Button data-id="okButton" onClick={this.submit}>
            Ok
          </Button>
        </Flex>
      </ApproveModalStyled>
    )
  }
}

export default ApproveModal
