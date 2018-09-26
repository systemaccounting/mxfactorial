import React from 'react'
import PropTypes from 'prop-types'

import Input from 'components/Form/Input'
import LabelWithValue from 'components/LabelWithValue'

const AccountHeader = ({ title, balance }) => (
  <React.Fragment>
    <LabelWithValue name="account" label="account" value={title} />
    <div>
      <Input disabled placeholder="balance" value={balance} />
    </div>
  </React.Fragment>
)

AccountHeader.propTypes = {
  title: PropTypes.string,
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default AccountHeader
