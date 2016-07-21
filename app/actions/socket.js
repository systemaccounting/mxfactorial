import { createAction } from 'redux-actions';

const createSocketAction = (type, event) => (data) => (createAction(type)({
  socket: true,
  event,
  data
}));

export default createSocketAction;
