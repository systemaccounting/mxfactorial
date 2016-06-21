// for validating if the user passed in correct
// signup information
export const signupValidation = values => {
  const errors = {}
  if (!values.user_create) {
    errors.user_create = 'Required'
  }

  if (!values.password_create) {
    errors.password_create = "Please provide a password"
  }

  if (!values.email_address_create) {
    errors.email_address_create = 'Required'
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email_address_create)) {
    errors.email_address_create = 'Invalid email address'
  }
  return errors
}
