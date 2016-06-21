
export function saveItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {
    alert('error while saving item to the local storage');
  }
}

export function getItem(data) {
  try {
    return JSON.parse(localStorage.getItem(data));
  } catch(e) {
    alert('error while retrieving item to the local storage');
  }
}
