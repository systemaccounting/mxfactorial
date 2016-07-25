import { connect } from 'react-redux';

import NotificationMenu from 'components/Header/NotificationMenu';
import { clearAll, readOne } from 'actions/notificationActions';
import unread from 'selectors/notification/unread';

function mapStateToProps(state) {
  return {
    notifications: unread(state)
  };
}

const mapDispatchToProps = {
  clearAll,
  readOne
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationMenu);
