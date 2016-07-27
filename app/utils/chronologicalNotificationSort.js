import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

export default (notifications) => (sortBy(map(notifications, (item, key) => (
  { ...item, id: key }
)), (v) => (- new Date(v.sent_time))));
