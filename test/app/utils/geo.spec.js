import { spy } from 'sinon';
import 'should-sinon';
import cloneDeep from 'lodash/cloneDeep';

import { getLocation, buildLatLng } from 'utils/geo';

describe('geo util', () => {
  const callback = spy();

  describe('#getLocation', () => {
    it('should return undefined when location isn\'t accessable', () => {
      getLocation(callback);
      callback.should.be.calledWith(undefined);
    });

    it('should return position when location accessable', () => {
      const fakePostionObj = { coords: { latitude: 1, longitude: 1 } };
      const saveGL = cloneDeep(window.navigator.geolocation);
      window.navigator.geolocation = {
        getCurrentPosition: (cb) => { cb(fakePostionObj); }
      };
      getLocation(callback);
      callback.should.be.calledWith(fakePostionObj);
      window.navigator.geolocation = saveGL;
    });
  });

  describe('#buildLatLng', () => {
    it('should return default when position is undefined', () => {
      buildLatLng().should.equal('0,0');
    });

    it('should return correct coords with supplied position', () => {
      buildLatLng({ coords: { latitude: 1, longitude: 1 } }).should.equal('1,1');
    });
  });
});
