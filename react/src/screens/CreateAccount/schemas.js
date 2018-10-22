const schemas = [
  {
    id: 'name',
    label: 'next',
    properties: {
      firstName: {
        type: 'string',
        inputType: 'text',
        name: 'firstName',
        placeholder: 'First Name',
        value: '',
        required: true
      },
      middleName: {
        type: 'string',
        inputType: 'text',
        name: 'middleName',
        placeholder: 'Middle Name',
        value: '',
        required: true
      },
      lastName: {
        type: 'string',
        inputType: 'text',
        name: 'lastName',
        placeholder: 'Last Name',
        value: '',
        required: true
      },
      country: {
        type: 'string',
        inputType: 'text',
        name: 'country',
        placeholder: 'Country',
        value: '',
        required: true
      }
    }
  },
  {
    id: 'address',
    key: 'address',
    label: 'Next',
    properties: {
      streetNumber: {
        type: 'string',
        inputType: 'text',
        name: 'streetNumber',
        placeholder: 'Street number',
        value: '',
        required: true
      },
      streetName: {
        type: 'string',
        inputType: 'text',
        name: 'streetName',
        placeholder: 'Street name',
        value: '',
        required: true
      },
      floorNumber: {
        type: 'string',
        inputType: 'text',
        name: 'floorNumber',
        placeholder: 'Floor number',
        value: '',
        required: true
      },
      unit: {
        type: 'string',
        inputType: 'text',
        name: 'unit',
        placeholder: 'Unit',
        value: '',
        required: true
      }
    }
  },
  {
    id: 'address-2',
    label: 'Next',
    properties: {
      cityName: {
        type: 'string',
        inputType: 'text',
        name: 'cityName',
        placeholder: 'City',
        value: '',
        required: true
      },
      stateName: {
        type: 'string',
        inputType: 'text',
        name: 'stateName',
        placeholder: 'State',
        value: '',
        required: true
      },
      postalCode: {
        type: 'string',
        inputType: 'text',
        name: 'postalCode',
        placeholder: 'Postal code',
        value: '',
        required: true
      }
    }
  },
  {
    id: 'address-3',
    label: 'Next',
    properties: {
      countryCode: {
        type: 'string',
        inputType: 'text',
        name: 'countryCode',
        placeholder: 'Country dialing code',
        value: '',
        required: true
      },
      areaCode: {
        type: 'string',
        inputType: 'text',
        name: 'areaCode',
        placeholder: 'Area Code',
        value: '',
        required: true
      },
      phoneNumber: {
        type: 'string',
        inputType: 'text',
        name: 'phoneNumber',
        placeholder: 'Phone Number',
        value: '',
        required: true
      }
    }
  },
  {
    id: 'personal-info',
    label: 'Next',
    properties: {
      dateOfBirth: {
        type: 'string',
        inputType: 'date',
        name: 'dateOfBirth',
        placeholder: 'Date of birth',
        value: '',
        required: true
      },
      industryName: {
        type: 'string',
        inputType: 'text',
        name: 'industryName',
        placeholder: 'Industry',
        value: '',
        required: true
      },
      occupation: {
        type: 'string',
        inputType: 'text',
        name: 'occupation',
        placeholder: 'Occupation',
        value: '',
        required: true
      }
    }
  },
  {
    id: 'account',
    label: 'Submit',
    properties: {
      username: {
        type: 'string',
        inputType: 'text',
        name: 'username',
        placeholder: 'Account',
        value: '',
        required: true
      },
      password: {
        type: 'string',
        inputType: 'text',
        name: 'password',
        placeholder: 'Password',
        value: '',
        required: true
      },
      emailAddress: {
        type: 'string',
        inputType: 'text',
        name: 'emailAddress',
        placeholder: 'Email Address',
        value: '',
        required: true
      }
    }
  }
]

export default schemas
