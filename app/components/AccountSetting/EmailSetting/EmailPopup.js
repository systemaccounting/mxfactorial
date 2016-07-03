import React, { Component, PropTypes } from 'react';

export default class EmailPopup extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    this.context.router.push('/AccountSetting/EmailSuccess');
  }

  render() {
    var { email } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup'>
          <form role='form' onSubmit={ this.handleSubmit }>
            <div>
              Confirm new address:
            </div>
            <div className='input radius5 font22'>
              <input type='email' className='text-center' defaultValue={ email } required={ true }/>
            </div>
            <div className='modal__footer text-center'>
              <button
                className={ `${buttonClass} btn__cancel` }
                onClick={ () => { this.context.router.push('/AccountSetting'); } }>
                Cancel
              </button>
              <button type='submit' className={ `${buttonClass} btn__ok` }>OK</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

EmailPopup.propTypes = {
  email: PropTypes.string
};

EmailPopup.contextTypes = {
  router: PropTypes.object
};
