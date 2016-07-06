import axios from 'axios';
import assign from 'lodash/assign';
import cookie from 'react-cookie';

import { BASE_URL } from 'constants/index';

export const clientConfig = {
  baseURL: BASE_URL,
  responseType: 'json'
};

const clientInstance = axios.create(clientConfig);

/* istanbul ignore next */
clientInstance.interceptors.request.use((config) => {
  const token = cookie.load('token');
  if (token) {
    config.headers = assign(config.headers, {
      'Authorization': token
    });
  }
  return config;
});

export default clientInstance;
