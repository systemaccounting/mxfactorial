import React, { PropTypes, Component } from 'react';

import MobileLayout from 'components/Layout/MobileLayout';
import CreateAccountNav from 'components/CreateAccountNav/CreateAccountNav';
import {
  CreateAccount01Body, CreateAccount02Body, CreateAccount03Body
} from 'components/CreateAccountInfoBody';
import CreateAccount10Body from 'containers/CreateAccountInfoBody/CreateAccount10Body';

export default class CreateAccounInfo extends Component {

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
        return this.componentTemplate('/',
          <CreateAccount01Body nextRoute='/CreateAccountInfo/2'/>);
      case '2':
        return this.componentTemplate('/CreateAccountInfo/1',
          <CreateAccount02Body nextRoute='/CreateAccountInfo/3' />);
      case '3':
        return this.componentTemplate('/CreateAccountInfo/2',
          <CreateAccount03Body nextRoute='/CreateAccount/1' />);
      case '4':
        return this.componentTemplate('/CreateAccount/6',
          <CreateAccount10Body/>);
      default:
        return this.componentTemplate('/',
          <CreateAccount01Body nextRoute='/CreateAccountInfo/2' />);
    }
  }

  render() {
    return (
      this.renderComponent(this.props.params.id)
    );
  }
}

CreateAccounInfo.propTypes = {
  params: PropTypes.object
};
