import React from 'react'
import PropTypes from 'prop-types'
import { Link } from '@reach/router'

import Button from 'components/Button'

export const ButtonLink = ({ to, text, theme, ...rest }) => (
  <Link to={to}>
    <Button {...rest} theme={theme}>
      {text}
    </Button>
  </Link>
)

ButtonLink.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  theme: PropTypes.string
}

ButtonLink.defaultProps = {
  theme: 'secondary'
}

export default ButtonLink
