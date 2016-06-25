import axios from 'axios';
import { BASE_URL } from 'constants/index';

export const clientConfig = {
  baseURL: BASE_URL,
  responseType: 'json'
};

const clientInstace = axios.create(clientConfig);
export default clientInstace;
