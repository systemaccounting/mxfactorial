import React, { Component, PropTypes } from 'react';
import map from 'lodash/map';

import { ACCOUNT_NOFICATIONS } from 'constants/index';

export default class NotificationSetting extends Component {
  renderFields() {
    const { notification_setting } = this.props;

    return map(ACCOUNT_NOFICATIONS, (val, key) => (
      <div key={ key } className='checkbox'>
        <label>
          <input type='checkbox' defaultChecked={ notification_setting[key] }/>
          { val }
        </label>
      </div>
    ));
  }

  render() {
    return (
      <div className='text-left' style={ { marginBottom: 20 } }>
        { this.renderFields() }
      </div>
    );
  }
}

NotificationSetting.propTypes = {
  notification_setting: PropTypes.object
};

NotificationSetting.defaultProps = {
  notification_setting: {
    publish_activity: false,
    password_per_transaction: true,
    password_per_request: true,
    notification_payment_receipt: true,
    notification_payment_sent: true,
    notification_request_receipt: false,
    notification_request_sent: false
  }
};
