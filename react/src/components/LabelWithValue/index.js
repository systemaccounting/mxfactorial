import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.div`
  margin: 0 auto;
  padding: 0;
  display: flex;
  margin-bottom: 0.2rem;
`

export const Label = styled.div`
  font-style: italic;
  color: #333;
`
export const Value = styled.div`
  color: rgb(255, 246, 113);
  margin-left: auto;
  text-shadow: 0.7px 0.7px rgba(92, 92, 95, 0.2);
`

const LabelWithValue = ({ name, label, value }) => (
  <Container name={name}>
    <Label name={`${name}-label`}>{label}</Label>
    <Value name={`${name}-value`}>{value}</Value>
  </Container>
)

LabelWithValue.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default LabelWithValue
