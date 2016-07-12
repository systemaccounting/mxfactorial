import { connect } from 'react-redux';

import NotificationMenu from 'components/Header/NotificationMenu';
import { clearAll } from 'actions/notificationActions';

function mapStateToProps(state) {
  return {
    notifications: state.notifications
  };
}

const mapDispatchToProps = {
  clearAll
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationMenu);
