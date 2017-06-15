import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MobileLayout from 'components/Layout/MobileLayout';
import CreateAccountNav from 'components/CreateAccountNav/CreateAccountNav';
import {
  FirstForm, SecondForm, ThirdForm, FourthForm, FifthForm, SixthForm
} from 'containers/CreateAccountForms';

export default class CreateAccount extends Component {

  componentTemplate(routerstep, component) {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep={ routerstep } />
        { component }
      </MobileLayout>
    );
  }

  renderComponent(param) {
    switch (param) {
      case '1':
        return this.componentTemplate('/CreateAccountInfo/3',
          <FirstForm nextRoute='/CreateAccount/2'/>);
      case '2':
        return this.componentTemplate('/CreateAccount/1',
          <SecondForm nextRoute='/CreateAccount/3' />);
      case '3':
        return this.componentTemplate('/CreateAccount/2',
          <ThirdForm nextRoute='/CreateAccount/4' />);
      case '4':
        return this.componentTemplate('/CreateAccount/3',
          <FourthForm nextRoute='/CreateAccount/5' />);
      case '5':
        return this.componentTemplate('/CreateAccount/4',
          <FifthForm nextRoute='/CreateAccount/6' />);
      case '6':
        return this.componentTemplate('/CreateAccount/5',
          <SixthForm nextRoute='/CreateAccountInfo/4' />);
      default:
        return this.componentTemplate('/CreateAccountInfo/3',
          <FirstForm nextRoute='/CreateAccount/2'/>);
    }
  }

  render() {
    return (
      this.renderComponent(this.props.params.id)
    );
  }
}

CreateAccount.propTypes = {
  params: PropTypes.object
};
