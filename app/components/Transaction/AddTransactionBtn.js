import React, { Component, PropTypes } from 'react';

import Plus from 'images/plus.png';

export default class AddTransactionBtn extends Component {
	render() {
    const { handleClick } = this.props;

    return (
      <div>
        <div className="indicator radius5 font22" onClick={handleClick}>
            <img src={Plus} className="plusIcon" />  good or service
        </div>
      </div>
    );
  }
}

AddTransactionBtn.propTypes = {
  handleClick: PropTypes.func.isRequired
};
