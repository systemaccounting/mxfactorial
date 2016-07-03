import React, { Component, PropTypes } from 'react';

export default class AccountProfileConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
    this.handlePost = this.handlePost.bind(this);
  }

  componentDidMount() {
    document.body.style.overflowY = 'hidden';
  }

  componentWillUnmount() {
    document.body.style.overflowY = '';
  }

  handlePost() {
    if (!this.refs.password.value) {
      this.setState({
        error: 'Password required'
      });
    } else {
      this.context.router.push('/AccountProfile/Success');
    }
  }

  render() {
    const { username } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup'>
          <div className='indicator radius5 font22 text-center transaction-amount'>
              { username } Profile
          </div>
          <div>
            Enter password:
          </div>
          <div className='input radius5 font22'>
            <input type='password' ref={ 'password' } placeholder='********' className='text-center'/>
          </div>
          <div className='error-message'>
            { this.state.error }
          </div>
          <div className='modal__footer text-center'>
            <button className={ `${buttonClass} btn__cancel` }
              onClick={ () => { this.context.router.push('/AccountProfile'); } }>
              Cancel
            </button>
            <button className={ `${buttonClass} btn__ok` }
              onClick={ this.handlePost }>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

AccountProfileConfirm.contextTypes = {
  router: PropTypes.object
};

AccountProfileConfirm.propTypes = {
  username: PropTypes.string
};

AccountProfileConfirm.defaultProps = {
  username: 'Sandy'
};
