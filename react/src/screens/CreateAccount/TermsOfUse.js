import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Button from 'components/Button'

const TermsOfUseContainer = styled.div`
  width: inherit;
  text-align: center;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const TermsOfUseParagraph = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.74);
  text-align: center;
  line-height: 1.4rem;
  padding: 0 2.3rem;
  &:nth-last-of-type(1) {
    margin-bottom: 1rem;
  }
  strong {
    color: white;
  }
`

export const TermsOfUseButton = styled(Button)`
  max-width: 15rem;
`

const TermsOfUse = ({ label, content, nextStep }) =>
  content && (
    <TermsOfUseContainer>
      {content.map((paragraph, index) => (
        <TermsOfUseParagraph
          key={index}
          dangerouslySetInnerHTML={{ __html: paragraph.join(' ') }}
        />
      ))}
      <TermsOfUseButton theme="secondary" onClick={nextStep} name="next-button">
        {label}
      </TermsOfUseButton>
    </TermsOfUseContainer>
  )

TermsOfUse.propTypes = {
  nextStep: PropTypes.func,
  label: PropTypes.string,
  content: PropTypes.arrayOf(PropTypes.array)
}

export default TermsOfUse
