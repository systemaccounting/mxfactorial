import each from 'lodash/each';
import URLSearchParams from 'url-search-params';

export default (data) => {
  const formData = new URLSearchParams();
  each(data, (v, k) => {
    formData.append(k, v);
  });
  return formData;
};
