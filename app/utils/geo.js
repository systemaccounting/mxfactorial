export const getLocation = (callback) => {
  if (window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(callback);
  } else {
    callback(undefined);
  }
};

export const buildLatLng = (position) => (
  position ? `${position.coords.latitude},${position.coords.longitude}` : '0,0'
);
