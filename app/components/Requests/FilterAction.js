import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './FilterAction.scss';

export default class FilterAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: true
    };
  }

  render() {
    const { handleActive, handleRejected, filter } = this.props;

    const activeClassName = classnames('btn__active', {
      active: filter === 'active'
    });
    const rejectedClassName = classnames('btn__rejected', {
      active: filter === 'rejected'
    });

    return (
      <div className='toggle-button'>
        <div className={ rejectedClassName } onClick={ handleRejected }>Rejected</div>
        <div className={ activeClassName } onClick={ handleActive }>Active</div>
      </div>
    );
  }
}

FilterAction.propTypes = {
  handleActive: PropTypes.func,
  handleRejected: PropTypes.func,
  filter: PropTypes.string
};
