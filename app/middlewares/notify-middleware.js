import notifyHub from 'socket/notify';

export default store => next => action => {
  if (action.payload && action.payload.socket && action.payload.event) {
    return notifyHub.emit(action.payload.event, action.payload.data);
  }
  return next(action);
};
